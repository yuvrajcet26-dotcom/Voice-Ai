import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import CallSession, CallEvent, MultilingualMessage
from app.services.ai.nlp_service import nlp_service
from app.services.ai.stt_service import stt_service
from app.services.ai.tts_service import tts_service
from app.services.ai.knowledge_retrieval import knowledge_retrieval_service
from app.services.counselor_dispatch.dispatch_service import counselor_dispatch_service

logger = logging.getLogger("ai_orchestrator")

class AIOrchestrator:
    """
    Coordinates speech-to-text, multilingual intent & entity understanding,
    university knowledge retrieval, counselor escalation, and text-to-speech synthesis.
    """

    @classmethod
    async def process_turn(
        cls,
        db: Session,
        call_id: str,
        text_input: Optional[str] = None,
        audio_base64: Optional[str] = None,
        language_override: Optional[str] = None
    ) -> Dict[str, Any]:
        call = db.query(CallSession).filter(CallSession.id == call_id).first()
        if not call:
            raise ValueError(f"Call session {call_id} not found.")

        # 1. Speech-to-Text if audio provided
        caller_text = text_input or ""
        if audio_base64 and not text_input:
            import base64
            audio_bytes = base64.b64decode(audio_base64)
            stt_result = await stt_service.transcribe_audio(audio_bytes, language=call.language)
            caller_text = stt_result.get("text", "")

        # 2. Multilingual Language Detection
        detected_lang = language_override or nlp_service.detect_language(caller_text)
        if detected_lang != call.language and detected_lang in ["en", "hi", "mr"]:
            call.language = detected_lang
            db.commit()

        # 3. Intent Detection & Entity Extraction
        intent = nlp_service.detect_intent(caller_text)
        entities = nlp_service.extract_entities(caller_text)

        # Update Session Context with newly extracted entities if available
        if entities.get("school"):
            call.school_id = entities["school"]
        if entities.get("course"):
            call.course_id = entities["course"]
        if entities.get("branch"):
            call.branch_id = entities["branch"]
        if entities.get("caller_name"):
            call.caller_name = entities["caller_name"]
        
        call.intent = intent
        db.commit()

        # 4. Process Intent
        counselor_requested = False
        dispatch_status = None
        assigned_counselor = None
        response_text = ""

        # Multilingual Greetings & Goodbye
        if intent == "GOODBYE":
            if call.language == "mr":
                response_text = "एसव्हीकेएम ग्लोबल युनिव्हर्सिटी, धुळे येथे संपर्क केल्याबद्दल धन्यवाद! आपला दिवस चांगला जावो."
            elif call.language == "hi":
                response_text = "एसवीकेएम ग्लोबल यूनिवर्सिटी, धुले में संपर्क करने के लिए धन्यवाद! आपका दिन शुभ हो।"
            else:
                response_text = "Thank you for contacting SVKM Global University, Dhule! Have a great day."
            call.status = "COMPLETED"
            db.commit()

        elif intent == "COUNSELOR_REQUEST":
            counselor_requested = True
            dispatch_result = await counselor_dispatch_service.request_counselor_assistance(
                db=db,
                call_session_id=call.id,
                caller_number=call.caller_number,
                school_code=call.school_id,
                course_code=call.course_id,
                branch_name=call.branch_id,
                language=call.language,
                query_text=caller_text
            )
            dispatch_status = dispatch_result.get("status")

            if dispatch_status == "OUTSIDE_HOURS":
                if call.language == "mr":
                    response_text = "आमचे समुपदेशक सध्या कार्यालयीन वेळेबाहेर आहेत. आम्ही आपली विनंती नोंदवली आहे, कार्यालयीन वेळेत आमचे प्रतिनिधी आपल्याशी संपर्क साधतील."
                elif call.language == "hi":
                    response_text = "विश्वविद्यालय का परामर्श कार्यालय अभी बंद है। हमने आपका कॉलबैक अनुरोध दर्ज कर लिया है, हमारे काउंसलर आपसे शीघ्र संपर्क करेंगे।"
                else:
                    response_text = "Our counselor office is currently closed outside university working hours. I have scheduled a priority callback for you."

            elif dispatch_status == "ALL_BUSY":
                if call.language == "mr":
                    response_text = "आमचे सर्व समुपदेशक सध्या इतर कॉल्सवर व्यस्त आहेत. मी आपल्यासाठी प्राधान्य कॉलबॅक विनंती तयार केली आहे."
                elif call.language == "hi":
                    response_text = "हमारे सभी काउंसलर इस समय अन्य कॉल्स पर व्यस्त हैं। हमने आपके लिए एक कॉलबैक अनुरोध बना दिया है।"
                else:
                    response_text = "All of our admission counselors are currently assisting other callers. I have created a priority callback request for you."

            elif dispatch_status == "NOTIFIED":
                if call.language == "mr":
                    response_text = f"मी आपल्या विनंतीनुसार {call.school_id or 'एसटीएमई'} च्या समुपदेशकांशी आपला कॉल जोडत आहे. कृपया काही सेकंद प्रतीक्षा करा."
                elif call.language == "hi":
                    response_text = f"मैं आपको {call.school_id or 'एसटीएमई'} के एडमिशन काउंसलर से कनेक्ट कर रहा हूँ। कृपया लाइन पर बने रहें।"
                else:
                    response_text = f"Connecting your call to an available admission counselor for {call.school_id or 'STME'}. Please hold the line."

        elif intent == "CALLBACK_REQUEST":
            counselor_dispatch_service.create_callback_request(
                db=db,
                caller_number=call.caller_number,
                call_id=call.id,
                caller_name=call.caller_name or "Caller",
                language=call.language,
                school_id=call.school_id,
                query=caller_text,
                preferred_time=entities.get("preferred_callback_time")
            )
            if call.language == "mr":
                response_text = "आपली कॉलबॅक विनंती यशस्वीरित्या नोंदवली आहे. आमचे समुपदेशक लवकरच संपर्क साधतील."
            elif call.language == "hi":
                response_text = "आपका कॉलबैक अनुरोध सफलतापूर्वक दर्ज कर लिया गया है। हमारे काउंसलर आपसे जल्द ही संपर्क करेंगे।"
            else:
                response_text = "Your callback request has been logged successfully. Our admissions team will reach out to you shortly."

        else:
            # Knowledge Query
            verified_answer = knowledge_retrieval_service.query_knowledge(
                db=db,
                intent=intent,
                school_code=call.school_id,
                course_code=call.course_id,
                branch_name=call.branch_id,
                language=call.language
            )

            if verified_answer:
                response_text = verified_answer
            else:
                # Default courteous university response
                if call.language == "mr":
                    response_text = "एसव्हीकेएम ग्लोबल युनिव्हर्सिटी, धुळे मध्ये आपले स्वागत आहे. आपण एसटीएमई, वाणिज्य किंवा फार्मसी मधील प्रवेश, फी किंवा पात्रतेबद्दल विचारू शकता, किंवा समुपदेशकाशी बोलू शकता."
                elif call.language == "hi":
                    response_text = "एसवीकेएम ग्लोबल यूनिवर्सिटी, धुले में आपका स्वागत है। आप एसटीएम्ई, कॉमर्स या फार्मेसी के प्रवेश, फीस या योग्यता के बारे में पूछ सकते हैं, या काउंसलर से बात कर सकते हैं।"
                else:
                    response_text = "Welcome to SVKM Global University, Dhule. You can inquire about STME B.Tech engineering, Commerce, or Pharmacy programs, fees, and eligibility, or ask to speak directly with an admission counselor."

        # 5. Synthesize Text-to-Speech
        tts_result = await tts_service.synthesize(response_text, language=call.language)

        # 6. Log Event
        event = CallEvent(
            call_session_id=call.id,
            event_type="AI_RESPONSE",
            details=f"Intent: {intent}, Language: {call.language}, Entities: {entities}"
        )
        db.add(event)
        db.commit()

        return {
            "call_id": call.id,
            "caller_text": caller_text,
            "detected_language": call.language,
            "detected_intent": intent,
            "detected_entities": {
                "school": call.school_id,
                "course": call.course_id,
                "branch": call.branch_id,
                "caller_name": call.caller_name
            },
            "ai_response_text": response_text,
            "audio_base64": tts_result.get("audio_base64"),
            "counselor_requested": counselor_requested,
            "counselor_dispatch_status": dispatch_status,
            "call_status": call.status,
            "workflow_node": call.current_workflow_node
        }

ai_orchestrator = AIOrchestrator()
