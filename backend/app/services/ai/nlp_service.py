import re
from typing import Dict, Any, Tuple

class MultilingualNLPService:
    """
    Multilingual NLP service evaluating and supporting:
    - English
    - Hindi
    - Marathi
    - Mixed English-Hindi / Mixed English-Marathi
    Detects language, extracts university entities (School, Course, Branch), and classifies user intents.
    """

    # School patterns
    SCHOOL_MAP = {
        "STME": ["stme", "technology", "engineering", "engineering college", "engg", "tech", "एसटीएमई", "अभियांत्रिकी"],
        "SOC": ["soc", "commerce", "management", "school of commerce", "एसओसी", "वाणिज्य"],
        "SPO": ["spo", "sptm", "pharmacy", "pharmaceutical", "pharma", "एसपीओ", "फार्मसी", "औषधनिर्माण"]
    }

    # Course patterns
    COURSE_MAP = {
        "B.Tech": ["b.tech", "btech", "b tech", "bachelor of technology", "बी टेक", "बी.टेक"],
        "M.Tech": ["m.tech", "mtech", "m tech", "master of technology", "एम टेक", "एम.टेक"],
        "MCA": ["mca", "master of computer applications", "एमसीए"],
        "BBA": ["bba", "bachelor of business administration", "बीबीए"],
        "B.Com": ["b.com", "bcom", "b com", "bachelor of commerce", "बी कॉम"],
        "MBA": ["mba", "master of business administration", "एमबीए"],
        "B.Pharm": ["b.pharm", "bpharm", "b pharm", "bachelor of pharmacy", "बी फार्म"],
        "D.Pharm": ["d.pharm", "dpharm", "d pharm", "diploma in pharmacy", "डी फार्म"]
    }

    # Branch patterns
    BRANCH_MAP = {
        "Electrical Engineering": ["electrical", "electrical engineering", "ee", "इलेक्ट्रिकल", "विद्युत अभियांत्रिकी"],
        "Computer Engineering": ["computer", "computer engineering", "cse", "computer science", "संगणक", "कम्प्यूटर"],
        "Information Technology": ["information technology", "it", "आयटी", "माहिती तंत्रज्ञान"],
        "Mechanical Engineering": ["mechanical", "mechanical engineering", "mech", "मेकॅनिकल", "यांत्रिकी"],
        "AI & Data Science": ["artificial intelligence", "ai", "data science", "aiml", "ai and ml", "आर्टिफिशिअल इंटेलिजन्स"],
        "Finance": ["finance", "वित्तीय", "फायनान्स"],
        "Marketing": ["marketing", "मार्केटिंग"],
        "Pharmaceutics": ["pharmaceutics", "pharmacology", "औषधनिर्माण शास्त्र"]
    }

    @classmethod
    def detect_language(cls, text: str) -> str:
        """Detect language: en, hi, mr, or mixed."""
        if not text:
            return "en"
        
        # Check Devanagari Unicode range
        devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text))
        total_letters = len(re.findall(r'[a-zA-Z\u0900-\u097F]', text))
        
        lower = text.lower()
        
        # Characteristic Marathi keywords (Latin or Devanagari)
        marathi_markers = [
            "आहे", "नाही", "सांगा", "हवी", "माहिती", "कधी", "किती", "कसे", "प्रवेश", "पाहिजे",
            "ahe", "havi", "mahiti", "kay", "kiti", "kase", "kuthe", "sangava", "shikshan", "shulk", "patrata", "boltoye"
        ]
        
        # Characteristic Hindi keywords (Latin or Devanagari)
        hindi_markers = [
            "है", "नहीं", "बताइए", "चाहिए", "जानकारी", "कब", "कितना", "कैसे", "दाखिला", "फीस",
            "chahiye", "bataiye", "jaankari", "kya", "kitna", "kaise", "kahan", "admission lena hai", "shiksha", "bol raha hu"
        ]

        marathi_score = sum(1 for m in marathi_markers if m in lower)
        hindi_score = sum(1 for h in hindi_markers if h in lower)

        if marathi_score > 0 and marathi_score >= hindi_score:
            return "mr"
        if hindi_score > 0:
            return "hi"

        if devanagari_chars > 0:
            # Script indicates Indic language
            if marathi_score > 0:
                return "mr"
            return "hi"

        return "en"

    @classmethod
    def detect_intent(cls, text: str) -> str:
        """Classify user query into one of 20+ admission and university intents."""
        lower = text.lower()

        # Counselor request
        if any(w in lower for w in [
            "counselor", "counsellor", "talk to human", "speak to someone", "representative", "officer",
            "काउंसलर", "समुपदेशक", "बात करनी है", "बोलणे आहे", "human agent", "transfer", "connect call"
        ]):
            return "COUNSELOR_REQUEST"

        # Callback request
        if any(w in lower for w in ["call back", "callback", "call me back", "कॉल बैक", "परत कॉल करा", "बाद में कॉल"]):
            return "CALLBACK_REQUEST"

        # Fees
        if any(w in lower for w in ["fee", "fees", "cost", "charges", "tuition", "फीस", "फी", "शुल्क", "कितना खर्चा", "kiti fees"]):
            return "FEES"

        # Eligibility
        if any(w in lower for w in ["eligibility", "eligible", "qualification", "criteria", "पात्रता", "योग्यता", "percentage", "cutoff"]):
            return "ELIGIBILITY"

        # Duration
        if any(w in lower for w in ["duration", "years", "how long", "अवधी", "कालावधी", "कितने साल"]):
            return "DURATION"

        # Intake / Seats
        if any(w in lower for w in ["intake", "seats", "capacity", "जागा", "सीटें", "कितनी सीट"]):
            return "INTAKE"

        # Placements
        if any(w in lower for w in ["placement", "placements", "package", "job", "salary", "कंपनी", "रिक्रूटमेंट", "नोकरी"]):
            return "PLACEMENT"

        # Scholarships
        if any(w in lower for w in ["scholarship", "financial aid", "concession", "शिष्यवृत्ती", "छात्रवृत्ति"]):
            return "SCHOLARSHIP"

        # Hostel / Accommodation
        if any(w in lower for w in ["hostel", "mess", "stay", "accommodation", "वसतिगृह", "हॉस्टल", "रहने की व्यवस्था"]):
            return "HOSTEL"

        # Facilities / Campus
        if any(w in lower for w in ["facility", "facilities", "campus", "lab", "library", "सुविधा", "परिसर", "प्रयोगशाळा"]):
            return "FACILITIES"

        # Contact / Address
        if any(w in lower for w in ["contact", "address", "phone number", "location", "reach", "पत्ता", "संपर्क", "फोन नंबर"]):
            return "CONTACT"

        # Admission process
        if any(w in lower for w in ["admission", "apply", "application", "form", "entrance exam", "cet", "jee", "प्रवेश", "दाखिला"]):
            return "ADMISSION_INFORMATION"

        # Branch inquiry
        if any(w in lower for w in ["branch", "specialization", "stream", "शाखा"]):
            return "BRANCH_INFORMATION"

        # Course inquiry
        if any(w in lower for w in ["course", "program", "degree", "अभ्यासक्रम", "कोर्स"]):
            return "COURSE_INFORMATION"

        # Goodbye
        if any(w in lower for w in ["bye", "goodbye", "thank you", "thanks", "धन्यवाद", "आभार"]):
            return "GOODBYE"

        # Repeat
        if any(w in lower for w in ["repeat", "pardon", "again", "फिर से", "पुन्हा सांगा"]):
            return "REPEAT"

        return "GENERAL_INFORMATION"

    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, Any]:
        """Extract school, course, branch, caller details, and callback time."""
        lower = text.lower()
        entities = {
            "school": None,
            "course": None,
            "branch": None,
            "caller_name": None,
            "caller_phone": None,
            "preferred_callback_time": None
        }

        # School extraction
        for school_code, keywords in cls.SCHOOL_MAP.items():
            if any(k in lower for k in keywords):
                entities["school"] = school_code
                break

        # Course extraction
        for course_code, keywords in cls.COURSE_MAP.items():
            if any(k in lower for k in keywords):
                entities["course"] = course_code
                break

        # Branch extraction
        for branch_name, keywords in cls.BRANCH_MAP.items():
            if any(k in lower for k in keywords):
                entities["branch"] = branch_name
                break

        # Name extraction
        name_match = re.search(r'(?:my name is|i am|mera naam|naam|mi|naav)\s+([a-zA-Z\u0900-\u097F]+)', text, re.IGNORECASE)
        if name_match:
            entities["caller_name"] = name_match.group(1).title()

        # Phone extraction
        phone_match = re.search(r'(\+?91[\-\s]?)?[6-9]\d{9}', text)
        if phone_match:
            entities["caller_phone"] = phone_match.group(0)

        # Preferred callback time
        time_match = re.search(r'(morning|afternoon|evening|tomorrow|kal|udya|10am|11am|2pm|4pm|shaam|sakali)', lower)
        if time_match:
            entities["preferred_callback_time"] = time_match.group(0)

        return entities

nlp_service = MultilingualNLPService()
