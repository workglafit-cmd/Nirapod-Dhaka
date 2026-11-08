"""
Public Safety Domain Dataset for Nirapod Dhaka Local NLP Model.
Contains curated labeled samples covering Bangla, Banglish, English, Code-Switched, and Noisy speech/spelling variants.
"""

TRAINING_DATA = [
    # Infrastructure - Open Manhole / Potholes / Broken Roads / Waterlogging / Streetlights
    {
        "text": "ei rastay ekta open manhole ase raat e dekha jay na onek dangerous",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "city_corp",
        "language": "Banglish"
    },
    {
        "text": "রাস্তায় খোলা ম্যানহোল আছে রাতে দেখা যায় না পথচারী পড়ে যেতে পারে",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "city_corp",
        "language": "Bangla"
    },
    {
        "text": "Dangerous open manhole on main road covered with plastic near Dhanmondi",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "city_corp",
        "language": "English"
    },
    {
        "text": "Mirpur-10 turning a manholer dhakna nai, night time walking is huge risk",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "city_corp",
        "language": "Code-switched"
    },
    {
        "text": "opn manhol on d road darkness inside, danger for bikrs",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "city_corp",
        "language": "Noisy"
    },
    {
        "text": "street light sob bondho, rasta puro andhakare bhora churi hobe kono din",
        "category": "infrastructure",
        "incident_type": "Broken Streetlight",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "city_corp",
        "language": "Banglish"
    },
    {
        "text": "রাস্তার ল্যাম্পপোস্ট নষ্ট, সম্পূর্ণ এলাকা অন্ধকার",
        "category": "infrastructure",
        "incident_type": "Broken Streetlight",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "city_corp",
        "language": "Bangla"
    },
    {
        "text": "Streetlights are completely out near Farmgate bridge",
        "category": "infrastructure",
        "incident_type": "Broken Streetlight",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "city_corp",
        "language": "English"
    },
    {
        "text": "biral rasta katse aro gorto hoye gese gari chola jachhe na huge pothole",
        "category": "infrastructure",
        "incident_type": "Potholes & Damaged Road",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "city_corp",
        "language": "Banglish"
    },
    {
        "text": "বৃষ্টির পর ড্রেন উপচে পুরো রাস্তায় জলাবদ্ধতা গাড়ি চলাচল বন্ধ",
        "category": "infrastructure",
        "incident_type": "Waterlogging",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "city_corp",
        "language": "Bangla"
    },
    {
        "text": "Massive waterlogging after rain blocking entire road near Uttara sector 4",
        "category": "infrastructure",
        "incident_type": "Waterlogging",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "city_corp",
        "language": "English"
    },

    # Crime - Theft / Snatching / Robbery / Harassment / Mugging
    {
        "text": "raat e ekhane ekjon ke churi korse light nai manushjon o kom",
        "category": "crime",
        "incident_type": "Snatching & Robbery",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "police",
        "language": "Banglish"
    },
    {
        "text": "রাতে এই গলিতে ছিনতাইকারী চাকু দেখিয়ে মোবাইল টাকা পয়সা নিয়ে গেছে",
        "category": "crime",
        "incident_type": "Snatching & Robbery",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "Bangla"
    },
    {
        "text": "Armed mugging reported near Lalmatia alley way behind college",
        "category": "crime",
        "incident_type": "Snatching & Robbery",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "English"
    },
    {
        "text": "ekhane chintaikari knife niye ghurteche, pedestrian security zero",
        "category": "crime",
        "incident_type": "Snatching & Robbery",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "Code-switched"
    },
    {
        "text": "ratre meye der ke eve teasing ar harassment korchhe kisu chele",
        "category": "crime",
        "incident_type": "Harassment",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "police",
        "language": "Banglish"
    },
    {
        "text": "মহিলাদের উত্ত্যক্ত করছে এবং হুমকি দিচ্ছে বাস স্ট্যান্ডের কাছে",
        "category": "crime",
        "incident_type": "Harassment",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "police",
        "language": "Bangla"
    },
    {
        "text": "Group of youths harassing female passersby near bus stop",
        "category": "crime",
        "incident_type": "Harassment",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "police",
        "language": "English"
    },
    {
        "text": "dokane churi hoyse shondhar por lock venge taka niye gese",
        "category": "crime",
        "incident_type": "Burglary & Theft",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "police",
        "language": "Banglish"
    },
    {
        "text": "bikel belay gari theke glass venge bag churi",
        "category": "crime",
        "incident_type": "Burglary & Theft",
        "severity": "medium",
        "urgency": "medium",
        "relevant_authority": "police",
        "language": "Banglish"
    },

    # Accident - Road Crash / Collision / Fire Hazard / Gas Leak / Electrical Risk
    {
        "text": "bikel 4 tay ekta bus ar truck mukhomukhi dhakka lagse onek manush ahoto police and ambulance dorkar",
        "category": "accident",
        "incident_type": "Vehicle Collision",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "Banglish"
    },
    {
        "text": "বাস ও মোটরসাইকেল মারাত্মক দুর্ঘটনা ঘটেছে আহত কয়েকজন জরুরি অ্যাম্বুলেন্স দরকার",
        "category": "accident",
        "incident_type": "Vehicle Collision",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "Bangla"
    },
    {
        "text": "Head-on collision between private car and bus, multiple injuries reported near Mohakhali flyover",
        "category": "accident",
        "incident_type": "Vehicle Collision",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "English"
    },
    {
        "text": "gari ulte gese road block casualties high emergency team pathan",
        "category": "accident",
        "incident_type": "Vehicle Collision",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "police",
        "language": "Code-switched"
    },
    {
        "text": "transfomer extreme spark korse agun lege jabe kono somoy disaster management dorkar",
        "category": "accident",
        "incident_type": "Electrical / Fire Hazard",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "dmb",
        "language": "Banglish"
    },
    {
        "text": "বৈদ্যুতিক তার ঝুলছে এবং স্পার্ক করছে যেকোনো সময় আগুন লাগতে পারে",
        "category": "accident",
        "incident_type": "Electrical / Fire Hazard",
        "severity": "high",
        "urgency": "high",
        "relevant_authority": "dmb",
        "language": "Bangla"
    },
    {
        "text": "Hanging live electric wires sparking near school gate high danger",
        "category": "accident",
        "incident_type": "Electrical / Fire Hazard",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "dmb",
        "language": "English"
    },
    {
        "text": "gas line leak stench coming out strong risk of explosion",
        "category": "accident",
        "incident_type": "Gas Leak",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "dmb",
        "language": "English"
    },
    {
        "text": "গ্যাস লাইনে লিক গন্ধ বের হচ্ছে ধোঁয়া উঠছে",
        "category": "accident",
        "incident_type": "Gas Leak",
        "severity": "critical",
        "urgency": "critical",
        "relevant_authority": "dmb",
        "language": "Bangla"
    },

    # Other - General Noise / Minor Garbage / Inquiries
    {
        "text": "moila fele thake regularly gondho hoy cleaning service pathan",
        "category": "other",
        "incident_type": "Garbage Accumulation",
        "severity": "low",
        "urgency": "low",
        "relevant_authority": "city_corp",
        "language": "Banglish"
    },
    {
        "text": "রাস্তার পাশে আবর্জনা জমে বিশ্রী দুর্গন্ধ ছড়াচ্ছে",
        "category": "other",
        "incident_type": "Garbage Accumulation",
        "severity": "low",
        "urgency": "low",
        "relevant_authority": "city_corp",
        "language": "Bangla"
    },
    {
        "text": "Loud music playing late at night causing disturbance",
        "category": "other",
        "incident_type": "Noise Disturbance",
        "severity": "low",
        "urgency": "low",
        "relevant_authority": "unknown",
        "language": "English"
    },
    {
        "text": "sound system blast in wedding community hall late night",
        "category": "other",
        "incident_type": "Noise Disturbance",
        "severity": "low",
        "urgency": "low",
        "relevant_authority": "unknown",
        "language": "English"
    }
]
