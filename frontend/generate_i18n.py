"""
Script to generate high-quality translation files for ml, mr, bn, gu, pa, or, ur.
"""
import json
from pathlib import Path

I18N_DIR = Path(r"c:\Users\Madhulika\OneDrive\Desktop\hack\frontend\src\i18n")

LANG_DATA = {
    "ml": {
        "app_name": "സരൾ",
        "tagline": "നിങ്ങളുടെ വൈദ്യുതിയും വെള്ളവും, ലളിതമായി.",
        "electricity": "വൈദ്യുതി",
        "water": "വെള്ളം",
        "home": "ഹോം",
        "bills": "ബിൽ വിശദീകരണം",
        "payments": "പേയ്‌മെന്റുകൾ",
        "outages": "തടസ്സങ്ങൾ",
        "updates": "അറിയിപ്പുകൾ",
        "assistant": "സരൾ AI",
        "why_higher": "എന്റെ ബിൽ എന്തുകൊണ്ട് കൂടി?",
        "explain_simply": "ലളിതമായി വിശദീകരിക്കുക",
        "read_aloud": "ശബ്ദത്തിൽ കേൾക്കുക",
        "do_not_repay": "ദയവായി വീണ്ടും പണം അടയ്ക്കരുത്. നിങ്ങളുടെ പണം സുരക്ഷിതമാണ്.",
        "copy_complaint": "പരാതി വിവരങ്ങൾ പകർത്തുക",
        "report_outage": "തടസ്സം റിപ്പോർട്ട് ചെയ്യുക"
    },
    "mr": {
        "app_name": "सरळ",
        "tagline": "तुमची वीज आणि पाणी, सोप्या भाषेत.",
        "electricity": "वीज",
        "water": "पाणी",
        "home": "मुख्यपृष्ठ",
        "bills": "बिल स्पष्टीकरण",
        "payments": "पेमेंट्स",
        "outages": "वीज खंडित",
        "updates": "सूचना",
        "assistant": "सरळ AI",
        "why_higher": "माझे बिल जास्त का आले?",
        "explain_simply": "सोप्या भाषेत सांगा",
        "read_aloud": "ऐका",
        "do_not_repay": "कृपया पुन्हा पेमेंट करू नका. तुमचे पैसे सुरक्षित आहेत.",
        "copy_complaint": "तक्रार प्रत करा",
        "report_outage": "तक्रार नोंदवा"
    },
    "bn": {
        "app_name": "সরল",
        "tagline": "আপনার বিদ্যুৎ এবং জল, সহজ ব্যাখ্যায়।",
        "electricity": "বিদ্যুৎ",
        "water": "জল",
        "home": "হোম",
        "bills": "বিল বিশ্লেষণ",
        "payments": "পেমেন্ট",
        "outages": "সংযোগ বিচ্ছিন্ন",
        "updates": "বিজ্ঞপ্তি",
        "assistant": "সরল AI",
        "why_higher": "আমার বিল কেন বৃদ্ধি পেল?",
        "explain_simply": "সহজে বুঝিয়ে বলুন",
        "read_aloud": "পড়ে শোনান",
        "do_not_repay": "দয়া করে পুনরায় পেমেন্ট করবেন না। আপনার টাকা নিরাপদ।",
        "copy_complaint": "অভিযোগ কপি করুন",
        "report_outage": "বিভ্রাট রিপোর্ট করুন"
    },
    "gu": {
        "app_name": "સરળ",
        "tagline": "તમારી વીજળી અને પાણી, સરળ સમજૂતી સાથે.",
        "electricity": "વીજળી",
        "water": "પાણી",
        "home": "હોમ",
        "bills": "બિલ સમજૂતી",
        "payments": "ચુકવણીઓ",
        "outages": "કાપની માહિતી",
        "updates": "સૂચનાઓ",
        "assistant": "સરળ AI",
        "why_higher": "મારું બિલ કેમ વધ્યું?",
        "explain_simply": "સરળ રીતે સમજાવો",
        "read_aloud": "સાંભળો",
        "do_not_repay": "કૃપા કરીને ફરીથી ચૂકવણી કરશો નહીં. તમારા પૈસા સુરક્ષિત છે.",
        "copy_complaint": "ફરિયાદ કૉપિ કરો",
        "report_outage": "સમસ્યા નોંધાવો"
    },
    "pa": {
        "app_name": "ਸਰਲ",
        "tagline": "ਤੁਹਾਡੀ ਬਿਜਲੀ ਅਤੇ ਪਾਣੀ, ਆਸਾਨ ਸ਼ਬਦਾਂ ਵਿੱਚ।",
        "electricity": "ਬਿਜਲੀ",
        "water": "ਪਾਣੀ",
        "home": "ਹੋਮ",
        "bills": "ਬਿੱਲ ਦਾ ਵੇਰਵਾ",
        "payments": "ਭੁਗਤਾਨ",
        "outages": "ਬਿਜਲੀ ਕੱਟ",
        "updates": "ਸੂਚਨਾਵਾਂ",
        "assistant": "ਸਰਲ AI",
        "why_higher": "ਮੇਰਾ ਬਿੱਲ ਕਿਉਂ ਵਧਿਆ?",
        "explain_simply": "ਸੌਖੇ ਢੰਗ ਨਾਲ ਸਮਝਾਓ",
        "read_aloud": "ਸੁਣੋ",
        "do_not_repay": "ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਭੁਗਤਾਨ ਨਾ ਕਰੋ। ਤੁਹਾਡੇ ਪੈਸੇ ਸੁਰੱਖਿਅਤ ਹਨ।",
        "copy_complaint": "ਸ਼ਿਕਾਇਤ ਕਾਪੀ ਕਰੋ",
        "report_outage": "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ"
    },
    "or": {
        "app_name": "ସରଳ",
        "tagline": "ଆପଣଙ୍କ ବିଦ୍ୟୁତ୍ ଏବଂ ଜଳ, ସରଳ ଭାଷାରେ।",
        "electricity": "ବିଦ୍ୟୁତ୍",
        "water": "ଜଳ",
        "home": "ହୋମ୍",
        "bills": "ବିଲ୍ ବିବରଣୀ",
        "payments": "ପେମେଣ୍ଟ",
        "outages": "ଯୋଗାଣ ବନ୍ଦ",
        "updates": "ସୂଚନା",
        "assistant": "ସରଳ AI",
        "why_higher": "ମୋର ବିଲ୍ କାହିଁକି ବଢ଼ିଲା?",
        "explain_simply": "ସରଳ ଭାବରେ ବୁଝାନ୍ତୁ",
        "read_aloud": "ଶୁଣନ୍ତୁ",
        "do_not_repay": "ଦୟାକରି ପୁନର୍ବାର ପେମେଣ୍ଟ କରନ୍ତୁ ନାହିଁ। ଆପଣଙ୍କ ଟଙ୍କା ସୁରକ୍ଷିତ ଅଛି।",
        "copy_complaint": "ଅଭିଯୋଗ କପି କରନ୍ତୁ",
        "report_outage": "ଅଭିଯୋଗ କରନ୍ତୁ"
    },
    "ur": {
        "app_name": "سرل",
        "tagline": "آپ کی بجلی اور پانی، آسان الفاظ میں۔",
        "electricity": "بجلی",
        "water": "پانی",
        "home": "ہوم",
        "bills": "بل کی وضاحت",
        "payments": "ادائیگیاں",
        "outages": "بجلی کی بندش",
        "updates": "اطلاعات",
        "assistant": "سرل AI",
        "why_higher": "میرا بل کیوں زیادہ آیا؟",
        "explain_simply": "آسان زبان میں سمجھائیں",
        "read_aloud": "آواز میں سنیں",
        "do_not_repay": "براہ کرم دوبارہ ادائیگی نہ کریں۔ آپ کی رقم محفوظ ہے۔",
        "copy_complaint": "شکایت کی تفصیلات کاپی کریں",
        "report_outage": "بندش کی اطلاع دیں"
    }
}

# Read base English structure
with open(I18N_DIR / "en.json", "r", encoding="utf-8") as f:
    en_base = json.load(f)

for code, d in LANG_DATA.items():
    lang_obj = json.loads(json.dumps(en_base))
    lang_obj["app"]["name"] = d["app_name"]
    lang_obj["app"]["tagline"] = d["tagline"]
    lang_obj["app"]["electricity"] = d["electricity"]
    lang_obj["app"]["water"] = d["water"]
    lang_obj["nav"]["home"] = d["home"]
    lang_obj["nav"]["bills"] = d["bills"]
    lang_obj["nav"]["payments"] = d["payments"]
    lang_obj["nav"]["outages"] = d["outages"]
    lang_obj["nav"]["updates"] = d["updates"]
    lang_obj["nav"]["assistant"] = d["assistant"]
    lang_obj["bills"]["why_higher_title"] = d["why_higher"]
    lang_obj["bills"]["explain_simply"] = d["explain_simply"]
    lang_obj["bills"]["read_aloud"] = d["read_aloud"]
    lang_obj["payments"]["do_not_repay"] = d["do_not_repay"]
    lang_obj["payments"]["copy_complaint"] = d["copy_complaint"]
    lang_obj["outages"]["report_button"] = d["report_outage"]

    target_path = I18N_DIR / f"{code}.json"
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(lang_obj, f, ensure_ascii=False, indent=2)
    print(f"Generated {code}.json")
