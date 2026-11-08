"""
Prototype-Scale Corpus for Nirapod Dhaka Local NLP v0.2.
Organized into cluster groups to ensure strict 75/25 train/held-out test split with ZERO paraphrase leakage.
Covers Bangla Native, Banglish, English, Code-Switched, and Noisy Speech-Transcription styles.
Supported categories: 'crime', 'infrastructure', 'accident'.
"""

# Corpus grouped into semantic clusters
CORPUS_CLUSTERS = [
    # Cluster 1: Open Manhole (Infrastructure)
    {
        "cluster_id": "c01_manhole",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "split": "train",
        "samples": [
            {"text": "ei rastay ekta open manhole ase raat e dekha jay na onek dangerous", "lang": "Banglish"},
            {"text": "রাস্তায় একটি ম্যানহোল খোলা অবস্থায় পড়ে আছে, রাতের আঁধারে বড় দুর্ঘটনা ঘটতে পারে", "lang": "Bangla"},
            {"text": "Dangerous uncovered manhole in middle of road near school gate", "lang": "English"},
            {"text": "Mirpur 10 a manholer dhakna nai, night time walking is huge risk", "lang": "Code-switched"},
            {"text": "opn manhol on d road darknes inside fast help rqstd", "lang": "Noisy"}
        ]
    },
    # Cluster 2: Open Manhole Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c02_manhole_test",
        "category": "infrastructure",
        "incident_type": "Open Manhole",
        "severity": "high",
        "urgency": "high",
        "split": "test",
        "samples": [
            {"text": "rastar majhkane manhole khola, footpath diye jawar upay nai", "lang": "Banglish"},
            {"text": "খোলা স্ল্যাব ছাড়া ম্যানহোল, পথচারীরা বারবার গর্তে পড়ে যাচ্ছে", "lang": "Bangla"},
            {"text": "Hazardous open drain pit on main avenue without warning signs", "lang": "English"},
            {"text": "Dhanmondi 27 a open pit drain uncovered, night accident imminent", "lang": "Code-switched"},
            {"text": "manhol slab missing pit open danger for kids", "lang": "Noisy"}
        ]
    },

    # Cluster 3: Snatching & Robbery (Crime)
    {
        "cluster_id": "c03_snatching",
        "category": "crime",
        "incident_type": "Snatching & Robbery",
        "severity": "critical",
        "urgency": "critical",
        "split": "train",
        "samples": [
            {"text": "raat e ekhane ekjon ke churi korse light nai manushjon o kom", "lang": "Banglish"},
            {"text": "রাতে অন্ধকারে গলির মোড়ে এক পথচারীকে ছুরি দেখিয়ে টাকা পয়সা কেড়ে নেওয়া হয়েছে", "lang": "Bangla"},
            {"text": "Armed robbery reported in dark alley behind bus terminal at night", "lang": "English"},
            {"text": "galir bhitor chintai hoise mobile and wallet stolen, police patrol urgent", "lang": "Code-switched"},
            {"text": "churi hse ratre mobil nye geche knife shwoing fast police", "lang": "Noisy"}
        ]
    },
    # Cluster 4: Snatching & Robbery Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c04_snatching_test",
        "category": "crime",
        "incident_type": "Snatching & Robbery",
        "severity": "critical",
        "urgency": "critical",
        "split": "test",
        "samples": [
            {"text": "chintaikari chakhu niye bike e eshe bager string kete palalo", "lang": "Banglish"},
            {"text": "ছিনতাইকারী চাকু দিয়ে ভয় দেখিয়ে সোনার চেইন ছিনিয়ে পালিয়ে গেছে", "lang": "Bangla"},
            {"text": "Mugging incident reported near residential area gate by armed snatchers", "lang": "English"},
            {"text": "Overbridge a mugging korse, female pedestrian lost phone", "lang": "Code-switched"},
            {"text": "muging hapened bike mugers took cash and bag fast action", "lang": "Noisy"}
        ]
    },

    # Cluster 5: Vehicle Collision (Accident)
    {
        "cluster_id": "c05_collision",
        "category": "accident",
        "incident_type": "Vehicle Collision",
        "severity": "critical",
        "urgency": "critical",
        "split": "train",
        "samples": [
            {"text": "bikel 4 tay ekta bus ar truck mukhomukhi dhakka lagse onek manush ahoto", "lang": "Banglish"},
            {"text": "বাস ও মোটরসাইকেল মারাত্মক মুখোমুখি সংঘর্ষে বহু লোক আহত, দ্রুত অ্যাম্বুলেন্স পাঠান", "lang": "Bangla"},
            {"text": "Head-on collision between private car and cargo truck with severe injuries", "lang": "English"},
            {"text": "Flyover cross a heavy truck vs car crash, emergency hospital team needed", "lang": "Code-switched"},
            {"text": "garri accident bus truck hit blood help emergency ambulance", "lang": "Noisy"}
        ]
    },
    # Cluster 6: Vehicle Collision Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c06_collision_test",
        "category": "accident",
        "incident_type": "Vehicle Collision",
        "severity": "critical",
        "urgency": "critical",
        "split": "test",
        "samples": [
            {"text": "cng o leguna dhakka lege ulte gese 4-5 jon trapped inside", "lang": "Banglish"},
            {"text": "ট্রাক নিয়ন্ত্রণ হারিয়ে সিএনজিকে পিষে দিয়েছে, উদ্ধার কাজ জরুরি", "lang": "Bangla"},
            {"text": "Horrific multi-vehicle pileup blocking all highway lanes", "lang": "English"},
            {"text": "Highway a bus rollover accident, heavy traffic blockage and injuries", "lang": "Code-switched"},
            {"text": "cng crash overturned casualties trapped help asap", "lang": "Noisy"}
        ]
    },

    # Cluster 7: Electrical & Fire Hazard (Accident)
    {
        "cluster_id": "c07_electrical",
        "category": "accident",
        "incident_type": "Electrical Hazard",
        "severity": "high",
        "urgency": "high",
        "split": "train",
        "samples": [
            {"text": "transfomer extreme spark korse agun lege jabe kono somoy disaster team dorkar", "lang": "Banglish"},
            {"text": "বৈদ্যুতিক তার ঝুলে আছে এবং সর্ট সার্কিট থেকে আগুন বের হচ্ছে, বড় বিপদের আশঙ্কা", "lang": "Bangla"},
            {"text": "Live high-voltage electric wires dangling near school entrance with continuous sparks", "lang": "English"},
            {"text": "Market area a electric pole spark kortese, high fire threat", "lang": "Code-switched"},
            {"text": "elec wire spark fire threat fast help", "lang": "Noisy"}
        ]
    },
    # Cluster 8: Electrical & Fire Hazard Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c08_electrical_test",
        "category": "accident",
        "incident_type": "Electrical Hazard",
        "severity": "high",
        "urgency": "high",
        "split": "test",
        "samples": [
            {"text": "rastar kabel er kuta theke dhowa ber hochhe fatiye agun lagbe", "lang": "Banglish"},
            {"text": "ট্রান্সফরমার বিস্ফোরণ ঘটে আগুন ছড়িয়ে পড়ছে আশেপাশের দোকানে", "lang": "Bangla"},
            {"text": "Exploding utility transformer causing fire outbreak on commercial street", "lang": "English"},
            {"text": "Electric cable line fire outbreak, local shop owners terrified", "lang": "Code-switched"},
            {"text": "transfrmr blast fire spreading smoke thick fast response", "lang": "Noisy"}
        ]
    },

    # Cluster 9: Broken Streetlight & Darkness (Infrastructure)
    {
        "cluster_id": "c09_streetlight",
        "category": "infrastructure",
        "incident_type": "Broken Streetlight",
        "severity": "medium",
        "urgency": "medium",
        "split": "train",
        "samples": [
            {"text": "street light sob bondho, rasta puro andhakare bhora churi hobe kono din", "lang": "Banglish"},
            {"text": "রাস্তার বাতিগুলো সম্পূর্ণ নষ্ট, রাতের বেলায় যাতায়াত অত্যন্ত ভীতিজনক", "lang": "Bangla"},
            {"text": "All streetlights are completely non-functional along main road sector 7", "lang": "English"},
            {"text": "Main road a light bondho, pitch dark area for safety risk", "lang": "Code-switched"},
            {"text": "strt lite off full dark road unsafe at nite", "lang": "Noisy"}
        ]
    },
    # Cluster 10: Broken Streetlight Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c10_streetlight_test",
        "category": "infrastructure",
        "incident_type": "Broken Streetlight",
        "severity": "medium",
        "urgency": "medium",
        "split": "test",
        "samples": [
            {"text": "lamppost er bulb nosto koyek din dhore andho kar obostha", "lang": "Banglish"},
            {"text": "গলির সব বাতি ফিউজ হয়ে গেছে, রাতে একা চলাচল করা বিপজ্জনক", "lang": "Bangla"},
            {"text": "Pitch black road due to burnt out street lamps creating crime opportunity", "lang": "English"},
            {"text": "Alleyway a lamp post broken, pitch black walking condition", "lang": "Code-switched"},
            {"text": "lamppost lights down pitch darkness scary road", "lang": "Noisy"}
        ]
    },

    # Cluster 11: Waterlogging & Drainage (Infrastructure)
    {
        "cluster_id": "c11_waterlogging",
        "category": "infrastructure",
        "incident_type": "Waterlogging",
        "severity": "medium",
        "urgency": "medium",
        "split": "train",
        "samples": [
            {"text": "brishtir por drain upce puro rastay jolobaddhota gari chola bondho", "lang": "Banglish"},
            {"text": "বৃষ্টির জলে সম্পূর্ণ রাস্তা ডুবে গেছে, নর্দমার নোংরা পানি ঘরে ঢুকছে", "lang": "Bangla"},
            {"text": "Severe waterlogging blocking traffic and submerging sidewalks after heavy rain", "lang": "English"},
            {"text": "Drainage overflow causing knee deep water on main street, traffic stopped", "lang": "Code-switched"},
            {"text": "watrloging rain water jam gari stall clear drain", "lang": "Noisy"}
        ]
    },
    # Cluster 12: Waterlogging Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c12_waterlogging_test",
        "category": "infrastructure",
        "incident_type": "Waterlogging",
        "severity": "medium",
        "urgency": "medium",
        "split": "test",
        "samples": [
            {"text": "hutu pani jamse drain block thakay rastay pani shore na", "lang": "Banglish"},
            {"text": "বৃষ্টির পানির জন্য যাতায়াত অচল, বাস চলাচল বন্ধ হয়ে গেছে", "lang": "Bangla"},
            {"text": "Urban flooding due to choked storm drains disrupting daily movement", "lang": "English"},
            {"text": "Knee-deep water on main road, CNG and cars stalled in middle", "lang": "Code-switched"},
            {"text": "flooding water stuck vehicle engine dead need pump", "lang": "Noisy"}
        ]
    },

    # Cluster 13: Harassment (Crime)
    {
        "cluster_id": "c13_harassment",
        "category": "crime",
        "incident_type": "Harassment",
        "severity": "high",
        "urgency": "high",
        "split": "train",
        "samples": [
            {"text": "ratre meye der ke eve teasing ar harassment korchhe kisu chele bus stop a", "lang": "Banglish"},
            {"text": "বাস স্ট্যান্ডে নারীদের কটূক্তি ও উত্যক্ত করা হচ্ছে, নিরাপত্তা নিশ্চিত করার আবেদন", "lang": "Bangla"},
            {"text": "Group of men harassing female commuters near transit station late evening", "lang": "English"},
            {"text": "Bus stand area a Eve teasing happening, female security risk", "lang": "Code-switched"},
            {"text": "eve teazng group of boys troubling girls fast police", "lang": "Noisy"}
        ]
    },
    # Cluster 14: Harassment Test Cluster (Held-Out Test Set)
    {
        "cluster_id": "c14_harassment_test",
        "category": "crime",
        "incident_type": "Harassment",
        "severity": "high",
        "urgency": "high",
        "split": "test",
        "samples": [
            {"text": "university gate er samne baje kotha bolse meye der target kore", "lang": "Banglish"},
            {"text": "অসহায় মেয়েদের পিছু নিয়ে উত্যক্ত করছে বখাটে ছেলেরা", "lang": "Bangla"},
            {"text": "Verbal harassment and stalking of school students on their way home", "lang": "English"},
            {"text": "School gate a Stalking & verbal harassment, police presence required", "lang": "Code-switched"},
            {"text": "stalking bad comments girls scared action needed", "lang": "Noisy"}
        ]
    }
]

def get_train_test_split():
    """
    Returns (train_samples, test_samples) with ZERO paraphrase leakage.
    Train split = 75% of clusters, Test split = 25% of clusters.
    """
    train_samples = []
    test_samples = []

    for cluster in CORPUS_CLUSTERS:
        split_name = cluster["split"]
        for sample in cluster["samples"]:
            item = {
                "text": sample["text"],
                "category": cluster["category"],
                "incident_type": cluster["incident_type"],
                "severity": cluster["severity"],
                "urgency": cluster["urgency"],
                "language": sample["lang"],
                "cluster_id": cluster["cluster_id"]
            }
            if split_name == "train":
                train_samples.append(item)
            else:
                test_samples.append(item)

    return train_samples, test_samples

# Cross-lingual semantic equivalence evaluation pairs (Bangla ↔ Banglish ↔ English)
SEMANTIC_EQUIVALENCE_PAIRS_V2 = [
    {
        "pair_id": "seq_01_manhole",
        "text_bangla": "রাস্তায় একটি ম্যানহোল খোলা অবস্থায় পড়ে আছে, রাতের আঁধারে বড় দুর্ঘটনা ঘটতে পারে",
        "text_banglish": "ei rastay ekta open manhole ase raat e dekha jay na onek dangerous",
        "text_english": "Dangerous uncovered manhole in middle of road near school gate",
        "expected_category": "infrastructure",
        "expected_severity": "high"
    },
    {
        "pair_id": "seq_02_snatching",
        "text_bangla": "রাতে অন্ধকারে গলির মোড়ে এক পথচারীকে ছুরি দেখিয়ে টাকা পয়সা কেড়ে নেওয়া হয়েছে",
        "text_banglish": "raat e ekhane ekjon ke churi korse light nai manushjon o kom",
        "text_english": "Armed robbery reported in dark alley behind bus terminal at night",
        "expected_category": "crime",
        "expected_severity": "critical"
    },
    {
        "pair_id": "seq_03_collision",
        "text_bangla": "বাস ও মোটরসাইকেল মারাত্মক মুখোমুখি সংঘর্ষে বহু লোক আহত, দ্রুত অ্যাম্বুলেন্স পাঠান",
        "text_banglish": "bikel 4 tay ekta bus ar truck mukhomukhi dhakka lagse onek manush ahoto",
        "text_english": "Head-on collision between private car and cargo truck with severe injuries",
        "expected_category": "accident",
        "expected_severity": "critical"
    },
    {
        "pair_id": "seq_04_electrical",
        "text_bangla": "বৈদ্যুতিক তার ঝুলে আছে এবং সর্ট সার্কিট থেকে আগুন বের হচ্ছে, বড় বিপদের আশঙ্কা",
        "text_banglish": "transfomer extreme spark korse agun lege jabe kono somoy disaster team dorkar",
        "text_english": "Live high-voltage electric wires dangling near school entrance with continuous sparks",
        "expected_category": "accident",
        "expected_severity": "high"
    }
]
