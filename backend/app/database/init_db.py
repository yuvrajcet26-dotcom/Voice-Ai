import json
import logging
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.models import (
    User, School, Course, Branch, Counselor, CounselorAssignment,
    KnowledgeBase, FAQ, PhoneNumber, TelephonyProvider, WorkingHours,
    Holiday, MultilingualMessage, Workflow, SystemSetting
)

logger = logging.getLogger("init_db")

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Telephony Provider (Exotel)
        exotel_provider = db.query(TelephonyProvider).filter(TelephonyProvider.name == "Exotel").first()
        if not exotel_provider:
            exotel_provider = TelephonyProvider(
                name="Exotel",
                provider_type="EXOTEL",
                account_reference="svkm_dhule_exotel",
                status="CONNECTED"
            )
            db.add(exotel_provider)
            db.commit()

        # 2. Virtual Phone Numbers
        num1 = db.query(PhoneNumber).filter(PhoneNumber.phone_number == "+91 2562 281456").first()
        if not num1:
            num1 = PhoneNumber(
                phone_number="+91 2562 281456",
                display_name="SVKM Dhule Central Admission ExoPhone",
                provider="Exotel",
                purpose="ADMISSION",
                scope="GLOBAL",
                status="ACTIVE",
                voice_enabled=True,
                sms_enabled=True,
                webhook_url="/api/v1/telephony/exotel/incoming"
            )
            db.add(num1)

        num2 = db.query(PhoneNumber).filter(PhoneNumber.phone_number == "+91 8047100000").first()
        if not num2:
            num2 = PhoneNumber(
                phone_number="+91 8047100000",
                display_name="STME Engineering Admission Hotline",
                provider="Exotel",
                purpose="SCHOOL_SPECIFIC",
                scope="SCHOOL",
                status="ACTIVE",
                voice_enabled=True,
                sms_enabled=True,
                webhook_url="/api/v1/telephony/exotel/incoming"
            )
            db.add(num2)
        db.commit()

        # 3. Schools
        schools_data = [
            {
                "code": "STME",
                "name": "School of Technology Management & Engineering",
                "short_name": "STME",
                "description": "Premier engineering and technology management campus offering B.Tech, M.Tech, and specialized technology programs at SVKM Dhule.",
                "head_name": "Dr. Rahul Sharma (Dean)",
                "email": "stme.admissions@svkm.ac.in",
                "phone": "+91 2562 281456",
                "website": "https://svkm-dhule.ac.in/stme",
                "address": "Behind Gurudwara, Mumbai-Agra Highway, Dhule, Maharashtra 424001",
                "status": "PUBLISHED"
            },
            {
                "code": "SOC",
                "name": "School of Commerce",
                "short_name": "SOC",
                "description": "Contemporary commerce and business administration programs with industry integration (B.Com, BBA, MBA).",
                "head_name": "Dr. Sunita Deshpande (Director)",
                "email": "soc.admissions@svkm.ac.in",
                "phone": "+91 2562 281458",
                "website": "https://svkm-dhule.ac.in/soc",
                "address": "SVKM Dhule Campus, Dhule, Maharashtra",
                "status": "PUBLISHED"
            },
            {
                "code": "SPO",
                "name": "School of Pharmacy & Technology Management",
                "short_name": "SPO",
                "description": "PCI approved pharmaceutical sciences institute offering B.Pharm and D.Pharm with advanced laboratory facilities.",
                "head_name": "Dr. Vikas Patil (Principal)",
                "email": "spo.admissions@svkm.ac.in",
                "phone": "+91 2562 281460",
                "website": "https://svkm-dhule.ac.in/spo",
                "address": "SVKM Dhule Campus, Dhule, Maharashtra",
                "status": "PUBLISHED"
            }
        ]

        school_records = {}
        for s_data in schools_data:
            s = db.query(School).filter(School.code == s_data["code"]).first()
            if not s:
                s = School(**s_data)
                db.add(s)
                db.commit()
                db.refresh(s)
            school_records[s.code] = s

        # 4. Courses
        courses_data = [
            {
                "school_code": "STME",
                "name": "Bachelor of Technology (B.Tech)",
                "code": "B.Tech",
                "description": "4-year intensive undergraduate engineering program with specialized industry tracks.",
                "eligibility": "10+2 with Physics, Mathematics & Chemistry/Comp with min 50% marks + MHT-CET / JEE score.",
                "duration": "4 Years",
                "intake": 300,
                "fees": "₹ 1,80,000 per annum",
                "admission_process": "CAP Rounds via DTE Maharashtra or Institute Level Quota",
                "status": "PUBLISHED"
            },
            {
                "school_code": "STME",
                "name": "Master of Technology (M.Tech)",
                "code": "M.Tech",
                "description": "Postgraduate research and applied engineering in Computer & Data Engineering.",
                "eligibility": "B.E. / B.Tech in relevant branch with min 50% + valid GATE score.",
                "duration": "2 Years",
                "intake": 36,
                "fees": "₹ 1,40,000 per annum",
                "status": "PUBLISHED"
            },
            {
                "school_code": "SOC",
                "name": "Bachelor of Business Administration (BBA)",
                "code": "BBA",
                "description": "3-year modern business management degree preparing corporate leaders.",
                "eligibility": "10+2 in any stream with min 50% marks.",
                "duration": "3 Years",
                "intake": 120,
                "fees": "₹ 1,10,000 per annum",
                "status": "PUBLISHED"
            },
            {
                "school_code": "SPO",
                "name": "Bachelor of Pharmacy (B.Pharm)",
                "code": "B.Pharm",
                "description": "4-year PCI and AICTE approved pharmaceutical sciences program.",
                "eligibility": "10+2 with Physics & Chemistry along with Math/Biology (min 45%) + MHT-CET.",
                "duration": "4 Years",
                "intake": 100,
                "fees": "₹ 1,50,000 per annum",
                "status": "PUBLISHED"
            }
        ]

        course_records = {}
        for c_data in courses_data:
            s_code = c_data.pop("school_code")
            s = school_records.get(s_code)
            if s:
                c = db.query(Course).filter(Course.school_id == s.id, Course.code == c_data["code"]).first()
                if not c:
                    c = Course(school_id=s.id, **c_data)
                    db.add(c)
                    db.commit()
                    db.refresh(c)
                course_records[c.code] = c

        # 5. Branches
        btech = course_records.get("B.Tech")
        if btech:
            branches_data = [
                {
                    "name": "Electrical Engineering",
                    "code": "EE",
                    "description": "Power systems, renewable energy, electric vehicle architectures and embedded microcontrollers.",
                    "eligibility": "10+2 with PCM (50%) + CET/JEE",
                    "intake": 60,
                    "fees": "₹ 1,80,000 per annum",
                    "duration": "4 Years",
                    "facilities": "High Voltage Laboratory, Power Electronics & Drives Lab, EV Charging Simulation Cell",
                    "placement_info": "Top Recruiters: L&T, Siemens, Tata Power, Schneider Electric. Highest: ₹ 14 LPA."
                },
                {
                    "name": "Computer Engineering",
                    "code": "CE",
                    "description": "Algorithms, cloud computing, cyber security, full-stack software development and distributed systems.",
                    "eligibility": "10+2 with PCM (50%) + CET/JEE",
                    "intake": 120,
                    "fees": "₹ 2,00,000 per annum",
                    "duration": "4 Years",
                    "facilities": "High Performance Computing Cluster, NVIDIA AI Lab, Cloud Virtualization Center",
                    "placement_info": "Top Recruiters: Google, Microsoft, Amazon, Infosys, Capgemini. Highest: ₹ 24 LPA."
                },
                {
                    "name": "Information Technology",
                    "code": "IT",
                    "description": "Enterprise networks, DevOps, data analytics, cloud architecture, and web systems.",
                    "eligibility": "10+2 with PCM (50%) + CET/JEE",
                    "intake": 60,
                    "fees": "₹ 1,90,000 per annum",
                    "duration": "4 Years",
                    "facilities": "Cisco Networking Lab, Enterprise Cloud Suite",
                    "placement_info": "Average: ₹ 7.2 LPA. Top Recruiters: Accenture, Cognizant, Wipro."
                },
                {
                    "name": "Mechanical Engineering",
                    "code": "ME",
                    "description": "Robotics, thermal systems, CAD/CAM automation, and additive manufacturing.",
                    "eligibility": "10+2 with PCM (50%) + CET/JEE",
                    "intake": 60,
                    "fees": "₹ 1,75,000 per annum",
                    "duration": "4 Years",
                    "facilities": "CNC Machining Center, Mechatronics & Robotics Lab, Wind Tunnel",
                    "placement_info": "Top Recruiters: Mahindra, Bharat Forge, Tata Motors. Highest: ₹ 12 LPA."
                }
            ]

            for b_data in branches_data:
                b = db.query(Branch).filter(Branch.course_id == btech.id, Branch.code == b_data["code"]).first()
                if not b:
                    b = Branch(course_id=btech.id, **b_data, status="PUBLISHED")
                    db.add(b)
            db.commit()

        # 6. Users & Counselors
        users_seed = [
            {"email": "admin@svkm.ac.in", "username": "admin", "name": "Dr. S. K. Mehta (Main Admin)", "role": "MAIN_ADMIN", "pass": "Admin@123"},
            {"email": "registrar@svkm.ac.in", "username": "registrar", "name": "Prof. R. V. Patil (Registrar)", "role": "REGISTRAR", "pass": "Registrar@123"},
            # STME Counselors A, B, C, D, E
            {"email": "counselor.a@svkm.ac.in", "username": "counselor_a", "name": "Prof. Anita Sharma", "role": "COUNSELOR", "phone": "+91 9820011001", "state": "BUSY", "school": "STME"},
            {"email": "counselor.b@svkm.ac.in", "username": "counselor_b", "name": "Prof. Bharat Patil", "role": "COUNSELOR", "phone": "+91 9820011002", "state": "BUSY", "school": "STME"},
            {"email": "counselor.c@svkm.ac.in", "username": "counselor_c", "name": "Prof. Chetan Deshmukh", "role": "COUNSELOR", "phone": "+91 9820011003", "state": "AVAILABLE", "school": "STME"},
            {"email": "counselor.d@svkm.ac.in", "username": "counselor_d", "name": "Prof. Deepali Kulkarni", "role": "COUNSELOR", "phone": "+91 9820011004", "state": "AVAILABLE", "school": "STME"},
            {"email": "counselor.e@svkm.ac.in", "username": "counselor_e", "name": "Prof. Eknath Shinde", "role": "COUNSELOR", "phone": "+91 9820011005", "state": "AVAILABLE", "school": "STME"},
            # SOC Counselor
            {"email": "counselor.soc@svkm.ac.in", "username": "counselor_soc_1", "name": "Dr. Sunita Jain", "role": "COUNSELOR", "phone": "+91 9820011006", "state": "AVAILABLE", "school": "SOC"},
            # SPO Counselor
            {"email": "counselor.spo@svkm.ac.in", "username": "counselor_spo_1", "name": "Dr. Milind Joshi", "role": "COUNSELOR", "phone": "+91 9820011007", "state": "AVAILABLE", "school": "SPO"},
        ]

        for u_data in users_seed:
            user = db.query(User).filter(User.email == u_data["email"]).first()
            if not user:
                user = User(
                    email=u_data["email"],
                    username=u_data["username"],
                    name=u_data["name"],
                    password_hash=hash_password(u_data.get("pass", "Counselor@123")),
                    phone=u_data.get("phone", "+91 2562 281456"),
                    role=u_data["role"],
                    status="ACTIVE"
                )
                db.add(user)
                db.commit()
                db.refresh(user)

            if u_data["role"] == "COUNSELOR":
                counselor = db.query(Counselor).filter(Counselor.user_id == user.id).first()
                if not counselor:
                    counselor = Counselor(
                        user_id=user.id,
                        phone_number=u_data.get("phone", "+91 9820011000"),
                        email=u_data["email"],
                        designation="Admission Counselor",
                        status="ACTIVE",
                        current_state=u_data.get("state", "AVAILABLE")
                    )
                    db.add(counselor)
                    db.commit()
                    db.refresh(counselor)

                    # Assignment to school
                    s_code = u_data.get("school", "STME")
                    s = school_records.get(s_code)
                    if s:
                        assign = CounselorAssignment(
                            counselor_id=counselor.id,
                            school_id=s.id,
                            priority=1,
                            active=True
                        )
                        db.add(assign)
                        db.commit()

        # 7. Knowledge Base & FAQs
        kb_items = [
            {
                "title": "SVKM Global University, Dhule Overview & Accreditation",
                "category": "University",
                "content": "SVKM Global University at Dhule is a premier educational institution established by Shri Vile Parle Kelavani Mandal, offering UGC and AICTE approved programs with world-class residential and research infrastructure.",
                "language": "en"
            },
            {
                "title": "STME B.Tech Engineering Admission & MHT-CET Cutoffs",
                "category": "Admission",
                "content": "Admissions to B.Tech at STME Dhule are conducted through Maharashtra State Common Entrance Test (MHT-CET) and JEE Main scores. Candidates must have secured minimum 50% in 10+2 PCM.",
                "language": "en"
            },
            {
                "title": "एसटीएमई अभियांत्रिकी प्रवेश आणि पात्रता निकष (मराठी)",
                "category": "Eligibility",
                "content": "एसटीएमई धुळे येथे बी.टेक प्रथम वर्ष प्रवेशासाठी उमेदवाराने १२ वी विज्ञान (भौतिकशास्त्र, रसायनशास्त्र आणि गणित) परीक्षेत किमान ५०% गुण मिळवणे आणि एमएचटी-सीईटी किंवा जेईई परीक्षा देणे अनिवार्य आहे.",
                "language": "mr"
            },
            {
                "title": "एसवीकेएम बी.टेक और बीसीए फीस संरचना (हिंदी)",
                "category": "Fees",
                "content": "एसवीकेएम ग्लोबल यूनिवर्सिटी धुले में बी.टेक की वार्षिक ट्यूशन फीस लगभग ₹ 1,80,000 प्रति वर्ष है। मेधावी छात्रों के लिए छात्रवृत्ति और वित्तीय सहायता भी उपलब्ध है।",
                "language": "hi"
            },
            {
                "title": "On-Campus Hostel & Mess Facilities",
                "category": "Hostel",
                "content": "Separate on-campus residential hostels for boys and girls with high-speed Wi-Fi, 24/7 security, gymnasium, medical center, and hygienic vegetarian cafeteria.",
                "language": "en"
            }
        ]

        for item in kb_items:
            existing = db.query(KnowledgeBase).filter(KnowledgeBase.title == item["title"]).first()
            if not existing:
                kb = KnowledgeBase(**item, status="PUBLISHED")
                db.add(kb)

        faqs_seed = [
            {
                "question": "What is the eligibility for B.Tech at STME Dhule?",
                "answer": "Candidate must have passed 10+2 with Physics and Mathematics along with Chemistry or Computer Science with minimum 50% aggregate marks, and appeared for MHT-CET or JEE Main.",
                "language": "en",
                "category": "Eligibility"
            },
            {
                "question": "एसटीएमई मध्ये बी.टेक प्रवेश प्रक्रिया कशी आहे?",
                "answer": "एसटीएमई धुळे येथे बी.टेक प्रवेश महाराष्ट्र राज्य सीईटी सेलच्या केंद्रीभूत प्रवेश प्रक्रियेद्वारे (CAP Rounds) किंवा संस्था स्तरावरील कोट्यातून होतात.",
                "language": "mr",
                "category": "Admission"
            },
            {
                "question": "क्या विश्वविद्यालय में छात्रावास (Hostel) की सुविधा उपलब्ध है?",
                "answer": "हाँ, एसवीकेएम धुले परिसर में छात्रों और छात्राओं के लिए अलग-अलग आधुनिक हॉस्टल, वाई-फाई और शाकाहारी मेस की उत्कृष्ट सुविधा उपलब्ध है।",
                "language": "hi",
                "category": "Hostel"
            }
        ]

        for f in faqs_seed:
            existing = db.query(FAQ).filter(FAQ.question == f["question"]).first()
            if not existing:
                faq = FAQ(**f, status="PUBLISHED")
                db.add(faq)
        db.commit()

        # 8. Working Hours (Mon - Sat 09:00 - 17:30 IST, Sun Closed)
        if db.query(WorkingHours).count() == 0:
            for day in range(7):
                is_closed = (day == 6) # Sunday closed
                end_time = "16:00" if day == 5 else "17:30"
                wh = WorkingHours(
                    day_of_week=day,
                    start_time="09:00",
                    end_time=end_time,
                    is_closed=is_closed,
                    timezone="Asia/Kolkata",
                    active=True
                )
                db.add(wh)
            db.commit()

        # 9. Holidays
        if db.query(Holiday).count() == 0:
            db.add(Holiday(name="Ganesh Chaturthi", date="2026-09-14", description="Maharashtra State Holiday", is_closed=True))
            db.add(Holiday(name="Gandhi Jayanti", date="2026-10-02", description="National Holiday", is_closed=True))
            db.add(Holiday(name="Diwali (Laxmi Pujan)", date="2026-11-08", description="Deepavali Festival", is_closed=True))
            db.commit()

        # 10. Multilingual Messages
        messages_seed = [
            ("OUTSIDE_WORKING_HOURS", "en", "Our counselor assistance is currently unavailable outside university working hours. I can record your request and have a counselor contact you tomorrow morning."),
            ("OUTSIDE_WORKING_HOURS", "hi", "विश्वविद्यालय का परामर्श कार्यालय अभी बंद है। हम आपका अनुरोध दर्ज कर रहे हैं, कल सुबह हमारे काउंसलर आपसे संपर्क करेंगे।"),
            ("OUTSIDE_WORKING_HOURS", "mr", "आमचे समुपदेशक सध्या कार्यालयीन वेळेबाहेर आहेत. आम्ही आपली विनंती नोंदवून घेत आहोत आणि उद्या सकाळी आमचे प्रतिनिधी आपल्याशी संपर्क साधतील."),
            ("ALL_BUSY", "en", "All of our admission counselors are currently assisting other callers. I can schedule a priority callback for you."),
            ("ALL_BUSY", "hi", "हमारे सभी काउंसलर इस समय अन्य छात्रों की सहायता में व्यस्त हैं। हम आपके लिए एक कॉलबैक अनुरोध बना रहे हैं।"),
            ("ALL_BUSY", "mr", "आमचे सर्व समुपदेशक सध्या इतर विद्यार्थ्यांशी बोलण्यात व्यस्त आहेत. मी आपल्यासाठी प्राधान्य कॉलबॅक नोंदवू शकतो.")
        ]

        for k, lang, text_val in messages_seed:
            existing = db.query(MultilingualMessage).filter(MultilingualMessage.message_key == k, MultilingualMessage.language == lang).first()
            if not existing:
                db.add(MultilingualMessage(message_key=k, language=lang, message_text=text_val, status="ACTIVE"))
        db.commit()

        # 11. Production Workflow
        if db.query(Workflow).count() == 0:
            wf = Workflow(
                name="SVKM Standard Admission Voice Flow",
                description="Default production multilingual admission routing graph",
                status="PUBLISHED",
                version=1,
                nodes_json=json.dumps([{"id": "1", "data": {"label": "START: Call Received"}}]),
                edges_json=json.dumps([])
            )
            db.add(wf)
            db.commit()

        logger.info("Database initialized and seeded with SVKM Global University Dhule data.")

    finally:
        db.close()
