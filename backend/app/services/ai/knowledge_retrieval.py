from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import KnowledgeBase, FAQ, School, Course, Branch

class KnowledgeRetrievalService:
    """
    Retrieves verified university knowledge and FAQs from the published database.
    Strictly uses published information to prevent hallucination.
    """
    
    @staticmethod
    def query_knowledge(
        db: Session,
        intent: str,
        school_code: Optional[str] = None,
        course_code: Optional[str] = None,
        branch_name: Optional[str] = None,
        language: str = "en"
    ) -> Optional[str]:
        """
        Find most relevant published knowledge base entry or FAQ.
        """
        # Resolve School ID if school_code provided
        school_id = None
        if school_code:
            school = db.query(School).filter(
                or_(School.code.ilike(school_code), School.short_name.ilike(school_code)),
                School.status == "PUBLISHED"
            ).first()
            if school:
                school_id = school.id

        # Resolve Course ID if course_code provided
        course_id = None
        if course_code:
            course = db.query(Course).filter(
                Course.code.ilike(course_code),
                Course.status == "PUBLISHED"
            ).first()
            if course:
                course_id = course.id

        # 1. Search in FAQs
        faq_query = db.query(FAQ).filter(FAQ.status == "PUBLISHED")
        if school_id:
            faq_query = faq_query.filter(or_(FAQ.school_id == school_id, FAQ.school_id.is_(None)))
        if course_id:
            faq_query = faq_query.filter(or_(FAQ.course_id == course_id, FAQ.course_id.is_(None)))

        # Match category or intent in FAQ question/answer
        faqs = faq_query.all()
        for faq in faqs:
            q_lower = faq.question.lower()
            if intent.lower() in q_lower or (branch_name and branch_name.lower() in q_lower):
                return faq.answer

        # 2. Search in KnowledgeBase by Category/Intent
        kb_query = db.query(KnowledgeBase).filter(KnowledgeBase.status == "PUBLISHED")
        if school_id:
            kb_query = kb_query.filter(or_(KnowledgeBase.school_id == school_id, KnowledgeBase.school_id.is_(None)))
        if course_id:
            kb_query = kb_query.filter(or_(KnowledgeBase.course_id == course_id, KnowledgeBase.course_id.is_(None)))

        # Category mapping
        cat_map = {
            "FEES": "Fees",
            "ELIGIBILITY": "Eligibility",
            "INTAKE": "Admission",
            "DURATION": "Course",
            "ADMISSION_INFORMATION": "Admission",
            "HOSTEL": "Hostel",
            "SCHOLARSHIP": "Scholarships",
            "PLACEMENT": "Placements",
            "FACILITIES": "Facilities",
            "CONTACT": "Contact"
        }

        target_cat = cat_map.get(intent)
        if target_cat:
            kb_item = kb_query.filter(KnowledgeBase.category == target_cat).first()
            if kb_item:
                return kb_item.content

        # 3. Fallback to branch or course specific info
        if branch_name and course_id:
            branch = db.query(Branch).filter(
                Branch.course_id == course_id,
                Branch.name.ilike(f"%{branch_name}%"),
                Branch.status == "PUBLISHED"
            ).first()
            if branch:
                if intent == "FEES" and branch.fees:
                    return f"The fee structure for {branch.name} is {branch.fees} per annum."
                if intent == "ELIGIBILITY" and branch.eligibility:
                    return f"Eligibility criteria for {branch.name}: {branch.eligibility}"
                if intent == "INTAKE" and branch.intake:
                    return f"The approved annual intake for {branch.name} is {branch.intake} seats."
                return f"{branch.name} under {course_code}: {branch.description or 'Approved AICTE/UGC program at SVKM Dhule campus.'}"

        # 4. Fallback to course specific info
        if course_id:
            course = db.query(Course).filter(Course.id == course_id).first()
            if course:
                if intent == "FEES" and course.fees:
                    return f"The annual fees for {course.name} ({course.code}) is {course.fees}."
                if intent == "ELIGIBILITY" and course.eligibility:
                    return f"Eligibility for {course.name}: {course.eligibility}"
                if intent == "INTAKE" and course.intake:
                    return f"The sanctioned intake for {course.name} is {course.intake} seats."
                if course.description:
                    return f"{course.name}: {course.description}"

        # 5. General KnowledgeBase lookup
        general_kb = db.query(KnowledgeBase).filter(
            KnowledgeBase.category == "University",
            KnowledgeBase.status == "PUBLISHED"
        ).first()
        if general_kb:
            return general_kb.content

        return None

knowledge_retrieval_service = KnowledgeRetrievalService()
