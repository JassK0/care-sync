"""
Drift Detection Service
Uses LLM to identify conflicts and differences between notes.
Deterministic structure with LLM-powered conflict detection.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

# Load .env.local for OpenAI API key
possible_paths = [
    Path(__file__).parent.parent.parent / ".env.local",  # From api/services/
    Path(__file__).parent.parent / ".env.local",  # From api/
    Path.cwd() / ".env.local",  # Current working directory
    Path.cwd().parent / ".env.local",  # Parent of current directory
]

env_loaded = False
for env_path in possible_paths:
    if env_path.exists():
        try:
            load_dotenv(env_path, override=True)
            env_loaded = True
            print(f"Loaded .env.local from: {env_path}")
            break
        except Exception as e:
            print(f"Warning: Could not load .env.local from {env_path}: {e}")
            continue

if not env_loaded:
    load_dotenv()

class DriftDetectionService:
    """
    Detects documentation divergence across roles using LLM-powered conflict detection.
    Structure is deterministic, but conflict identification uses LLM.
    """
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")
        
        api_key = api_key.strip().strip('"').strip("'")
        
        if api_key == "your_openai_api_key_here" or not api_key.startswith("sk-"):
            raise ValueError(f"OPENAI_API_KEY appears to be invalid.")
        
        self.client = OpenAI(api_key=api_key, timeout=30.0)
        self.model = "gpt-4o-mini"
        
        # Load time window from environment (default to 12 hours if not set)
        time_window_str = os.getenv("DRIFT_TIME_WINDOW_HOURS", "12")
        try:
            self.time_window_hours = int(time_window_str.strip())
            print(f"Using drift time window: {self.time_window_hours} hours")
        except ValueError:
            print(f"Warning: Invalid DRIFT_TIME_WINDOW_HOURS value '{time_window_str}', using default 12 hours")
            self.time_window_hours = 12
        
        # Rule-based structure (deterministic)
        self.drift_rules = {
            "cross_role_conflict": self._detect_cross_role_conflicts,
            "unacknowledged_concerns": self._detect_unacknowledged_concerns,
        }
    
    def detect_drift(self, notes: List[Dict[str, Any]], extracted_facts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect drift across all notes and their extracted facts.
        
        Returns list of drift alerts with:
        - alert_id
        - alert_type
        - severity
        - roles_involved
        - conflicting_facts
        - conflicting_fact_types
        - time_window
        - source_note_ids
        - description
        """
        alerts = []
        
        # Group facts by patient and time
        facts_by_patient = self._group_facts_by_patient(notes, extracted_facts)
        
        # Run each drift detection rule
        for rule_name, rule_func in self.drift_rules.items():
            try:
                rule_alerts = rule_func(facts_by_patient, notes)
                alerts.extend(rule_alerts)
            except Exception as e:
                print(f"Error in drift rule {rule_name}: {e}")
                continue
        
        # Sort by timestamp (most recent first)
        alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return alerts
    
    def _group_facts_by_patient(self, notes: List[Dict[str, Any]], extracted_facts: List[Dict[str, Any]]) -> Dict[str, Dict]:
        """Group facts by patient ID for analysis."""
        patient_facts = defaultdict(lambda: {
            "notes": [],
            "facts": [],
            "by_role": defaultdict(list),
            "by_type": defaultdict(list)
        })
        
        # Create mapping of note_id to note
        note_map = {note["note_id"]: note for note in notes}
        
        for fact_data in extracted_facts:
            note_id = fact_data.get("note_id")
            if note_id not in note_map:
                continue
            
            note = note_map[note_id]
            patient_id = note.get("patient_id", "unknown")
            
            patient_facts[patient_id]["notes"].append(note)
            patient_facts[patient_id]["facts"].extend(fact_data.get("facts", []))
            
            role = note.get("author_role", "unknown")
            patient_facts[patient_id]["by_role"][role].extend(fact_data.get("facts", []))
            
            for fact in fact_data.get("facts", []):
                fact_type = fact.get("type", "other")
                patient_facts[patient_id]["by_type"][fact_type].append({
                    "fact": fact,
                    "note": note,
                    "role": role
                })
        
        return dict(patient_facts)
    
    def _detect_cross_role_conflicts(self, patient_facts: Dict, notes: List[Dict]) -> List[Dict]:
        """
        Use LLM to detect conflicts between different roles.
        Examples: RN documents worsening while MD documents improvement,
                 PT documents decline while MD documents improvement.
        """
        alerts = []
        
        for patient_id, data in patient_facts.items():
            # Get all notes for this patient, sorted by time
            patient_notes = sorted(data["notes"], key=lambda x: x.get("timestamp", ""))
            
            if len(patient_notes) < 2:
                continue
            
            # Group notes by role and time windows
            # Check for conflicts within 24-48 hour windows
            for i, note1 in enumerate(patient_notes):
                for note2 in patient_notes[i+1:]:
                    # Only check notes from different roles
                    role1 = note1.get("author_role", "")
                    role2 = note2.get("author_role", "")
                    
                    if role1 == role2:
                        continue
                    
                    # Check if within configured time window
                    if not self._within_time_window(note1, note2, hours=self.time_window_hours):
                        continue
                    
                    # Get facts for these notes
                    facts1 = [item for item in data["by_type"].values() 
                             for item in item if item["note"]["note_id"] == note1["note_id"]]
                    facts2 = [item for item in data["by_type"].values() 
                             for item in item if item["note"]["note_id"] == note2["note_id"]]
                    
                    if not facts1 or not facts2:
                        continue
                    
                    # Use LLM to detect if there's a conflict
                    conflict_result = self._llm_detect_conflict(
                        note1, note2, 
                        [item["fact"] for item in facts1],
                        [item["fact"] for item in facts2],
                        role1, role2
                    )
                    
                    if conflict_result and conflict_result.get("is_conflict"):
                        # Create alert
                        conflicting_facts = []
                        for item in facts1:
                            if any(f.get("type") == conflict_result.get("conflicting_type") for f in [item["fact"]]):
                                conflicting_facts.append({
                                    "role": role1,
                                    "fact": item["fact"],
                                    "note_id": note1["note_id"],
                                    "note_timestamp": note1.get("timestamp", "")
                                })
                        for item in facts2:
                            if any(f.get("type") == conflict_result.get("conflicting_type") for f in [item["fact"]]):
                                conflicting_facts.append({
                                    "role": role2,
                                    "fact": item["fact"],
                                    "note_id": note2["note_id"],
                                    "note_timestamp": note2.get("timestamp", "")
                                })
                        
                        if conflicting_facts:
                            conflicting_types = list(set([cf["fact"].get("type", "unknown") for cf in conflicting_facts]))
                            time_diff = self._calculate_time_diff(note1, note2)
                            
                            alerts.append({
                                "alert_id": f"conflict_{patient_id}_{note1['note_id']}_{note2['note_id']}",
                                "alert_type": conflict_result.get("conflict_type", "cross_role_conflict"),
                                "severity": conflict_result.get("severity", "medium"),
                                "patient_id": patient_id,
                                "roles_involved": [role1, role2],
                                "conflicting_fact_types": conflicting_types,
                                "conflicting_facts": conflicting_facts,
                                "time_window": time_diff,
                                "source_note_ids": [note1["note_id"], note2["note_id"]],
                                "description": conflict_result.get("description", f"{role1} and {role2} document conflicting information"),
                                "timestamp": max(note1.get("timestamp", ""), note2.get("timestamp", ""))
                            })
        
        return alerts
    
    def _detect_unacknowledged_concerns(self, patient_facts: Dict, notes: List[Dict]) -> List[Dict]:
        """
        Use LLM to detect patient concerns documented multiple times without MD acknowledgement.
        """
        alerts = []
        
        for patient_id, data in patient_facts.items():
            # Get all symptom/concern facts
            concern_facts = []
            for fact_type in ["symptoms", "other"]:
                concern_facts.extend(data["by_type"].get(fact_type, []))
            
            if len(concern_facts) < 2:
                continue
            
            # Group by time windows
            concern_facts.sort(key=lambda x: x["note"].get("timestamp", ""))
            
            # Check for patterns: same concern mentioned multiple times by non-MD roles
            for i in range(len(concern_facts)):
                for j in range(i+1, len(concern_facts)):
                    item1 = concern_facts[i]
                    item2 = concern_facts[j]
                    
                    role1 = item1["role"]
                    role2 = item2["role"]
                    
                    # Skip if both are MD roles
                    if role1 in ["MD", "DO", "NP", "PA"] and role2 in ["MD", "DO", "NP", "PA"]:
                        continue
                    
                    # Check if within configured time window
                    if not self._within_time_window(item1["note"], item2["note"], hours=self.time_window_hours):
                        continue
                    
                    # Use LLM to check if these represent the same concern
                    is_same_concern = self._llm_check_same_concern(
                        item1["fact"], item2["fact"],
                        item1["note"], item2["note"],
                        role1, role2
                    )
                    
                    if is_same_concern:
                        # Check if MD has acknowledged this concern
                        md_acknowledged = False
                        for md_item in concern_facts:
                            if md_item["role"] in ["MD", "DO", "NP", "PA"]:
                                if self._within_time_window(item1["note"], md_item["note"], hours=self.time_window_hours):
                                    # Use LLM to check if MD acknowledged the concern
                                    if self._llm_check_acknowledgement(item1["fact"], md_item["fact"]):
                                        md_acknowledged = True
                                        break
                        
                        if not md_acknowledged:
                            conflicting_types = [item1["fact"].get("type", "symptoms"), item2["fact"].get("type", "symptoms")]
                            time_diff = self._calculate_time_diff(item1["note"], item2["note"])
                            
                            alerts.append({
                                "alert_id": f"unack_{patient_id}_{item1['note']['note_id']}_{item2['note']['note_id']}",
                                "alert_type": "symptom_acknowledgement",
                                "severity": "low",
                                "patient_id": patient_id,
                                "roles_involved": list(set([role1, role2])),
                                "conflicting_fact_types": list(set(conflicting_types)),
                                "conflicting_facts": [
                                    {
                                        "role": role1,
                                        "fact": item1["fact"],
                                        "note_id": item1["note"]["note_id"],
                                        "note_timestamp": item1["note"].get("timestamp", "")
                                    },
                                    {
                                        "role": role2,
                                        "fact": item2["fact"],
                                        "note_id": item2["note"]["note_id"],
                                        "note_timestamp": item2["note"].get("timestamp", "")
                                    }
                                ],
                                "time_window": time_diff,
                                "source_note_ids": [item1["note"]["note_id"], item2["note"]["note_id"]],
                                "description": f"Patient concern documented by {role1} and {role2} without physician acknowledgement",
                                "timestamp": max(item1["note"].get("timestamp", ""), item2["note"].get("timestamp", ""))
                            })
        
        return alerts
    
    def _llm_detect_conflict(self, note1: Dict, note2: Dict, facts1: List[Dict], facts2: List[Dict], 
                            role1: str, role2: str) -> Optional[Dict]:
        """Use LLM to detect if two notes from different roles contain conflicting information."""
        try:
            prompt = f"""You are analyzing clinical notes to detect documentation drift/conflicts.

Note 1 (from {role1}):
Timestamp: {note1.get('timestamp', 'unknown')}
Text: {note1.get('note_text', '')[:500]}

Extracted Facts from Note 1:
{json.dumps(facts1, indent=2)[:1000]}

Note 2 (from {role2}):
Timestamp: {note2.get('timestamp', 'unknown')}
Text: {note2.get('note_text', '')[:500]}

Extracted Facts from Note 2:
{json.dumps(facts2, indent=2)[:1000]}

Analyze if these notes contain CONFLICTING information. Examples:
- One role documents worsening/decline while another documents improvement/stability
- One role documents a problem while another doesn't acknowledge it
- Contradictory assessments of the same clinical parameter

Return ONLY valid JSON:
{{
    "is_conflict": true/false,
    "conflict_type": "oxygen_worsening" | "vital_sign_drift" | "functional_status_drift" | "other",
    "conflicting_type": "the fact type that conflicts (e.g., oxygen_requirement, vital_sign)",
    "severity": "high" | "medium" | "low",
    "description": "Brief description of the conflict (e.g., 'RN documents worsening oxygen requirements while MD documents improvement')"
}}

If no conflict, return: {{"is_conflict": false}}"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a clinical documentation analysis system. Analyze notes for conflicts. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"},
                timeout=15.0
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            if result.get("is_conflict"):
                return result
            return None
            
        except Exception as e:
            print(f"Error in LLM conflict detection: {e}")
            return None
    
    def _llm_check_same_concern(self, fact1: Dict, fact2: Dict, note1: Dict, note2: Dict, 
                                role1: str, role2: str) -> bool:
        """Use LLM to check if two facts represent the same patient concern."""
        try:
            prompt = f"""You are analyzing if two clinical facts represent the SAME patient concern.

Fact 1 (from {role1}):
Type: {fact1.get('type', 'unknown')}
Value: {fact1.get('value', '')}
Details: {fact1.get('details', '')}
Source Quote: {fact1.get('source_quote', '')}

Fact 2 (from {role2}):
Type: {fact2.get('type', 'unknown')}
Value: {fact2.get('value', '')}
Details: {fact2.get('details', '')}
Source Quote: {fact2.get('source_quote', '')}

Determine if these represent the SAME concern/symptom/issue, even if worded differently.

Return ONLY valid JSON:
{{
    "is_same_concern": true/false,
    "reason": "brief explanation"
}}"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a clinical fact analysis system. Determine if facts represent the same concern. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"},
                timeout=10.0
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            return result.get("is_same_concern", False)
            
        except Exception as e:
            print(f"Error in LLM same concern check: {e}")
            return False
    
    def _llm_check_acknowledgement(self, concern_fact: Dict, md_fact: Dict) -> bool:
        """Use LLM to check if MD fact acknowledges the concern fact."""
        try:
            prompt = f"""You are analyzing if a physician note ACKNOWLEDGES a patient concern.

Patient Concern (from non-MD role):
Type: {concern_fact.get('type', 'unknown')}
Value: {concern_fact.get('value', '')}
Details: {concern_fact.get('details', '')}

Physician Note Fact:
Type: {md_fact.get('type', 'unknown')}
Value: {md_fact.get('value', '')}
Details: {md_fact.get('details', '')}

Determine if the physician fact ACKNOWLEDGES, ADDRESSES, or RESPONDS TO the concern.

Return ONLY valid JSON:
{{
    "is_acknowledged": true/false,
    "reason": "brief explanation"
}}"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a clinical documentation analysis system. Determine if a concern is acknowledged. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"},
                timeout=10.0
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            return result.get("is_acknowledged", False)
            
        except Exception as e:
            print(f"Error in LLM acknowledgement check: {e}")
            return False
    
    def _within_time_window(self, note1: Dict, note2: Dict, hours: int = 24) -> bool:
        """Check if two notes are within specified time window."""
        try:
            ts1 = datetime.fromisoformat(note1.get("timestamp", "").replace("T", " "))
            ts2 = datetime.fromisoformat(note2.get("timestamp", "").replace("T", " "))
            delta = abs(ts1 - ts2)
            return delta <= timedelta(hours=hours)
        except:
            return False
    
    def _calculate_time_diff(self, note1: Dict, note2: Dict) -> str:
        """Calculate and format time difference between two notes."""
        try:
            ts1 = datetime.fromisoformat(note1.get("timestamp", "").replace("T", " "))
            ts2 = datetime.fromisoformat(note2.get("timestamp", "").replace("T", " "))
            delta = abs(ts1 - ts2)
            
            hours = delta.total_seconds() / 3600
            if hours < 1:
                return f"{int(delta.total_seconds() / 60)} minutes"
            elif hours < 24:
                return f"{int(hours)} hours"
            else:
                return f"{int(hours / 24)} days"
        except:
            return "unknown"
