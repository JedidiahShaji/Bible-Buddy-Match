document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const quizSection = document.getElementById("quizSection");
  const resultSection = document.getElementById("resultSection");
  const quizForm = document.getElementById("quizForm");
  const submitQuiz = document.getElementById("submitQuiz");
  const resultText = document.getElementById("resultText");
  const tryAgain = document.getElementById("tryAgain");

  // ---------- Character Dataset ----------
  const characters = [
    { name: "David",
      traits: ["brave", "creative", "faithful", "joyful", "protective"],
      reference: "1 Samuel 17 — Faced Goliath with faith.",
      whyMatch: "You're brave like David because you stand up for what's right!" },
    { name: "Esther",
      traits: ["wise", "brave", "faithful", "kind"],
      reference: "Esther 4:14 — For such a time as this.",
      whyMatch: "You're wise and brave like Esther—caring for others even when it's hard!" },
    { name: "Ruth",
      traits: ["kind", "humble", "faithful", "resilient"],
      reference: "Ruth 1 — Ruth stayed faithful to family.",
      whyMatch: "You're kind and steady like Ruth—faithful to friends and family!" },
    { name: "Daniel",
      traits: ["faithful", "wise", "brave", "resilient"],
      reference: "Daniel 6 — Stood firm and trusted God.",
      whyMatch: "You're steady like Daniel—wise and brave when things get tough!" },
    { name: "Joseph",
      traits: ["dreamer", "wise", "resilient", "humble", "faithful"],
      reference: "Genesis 37–45 — From dreams to helping many.",
      whyMatch: "You're a dreamer like Joseph—using wisdom and kindness to help others!" },
    { name: "Deborah",
      traits: ["brave", "wise", "teacher", "faithful"],
      reference: "Judges 4–5 — A wise and courageous leader.",
      whyMatch: "You're a strong helper like Deborah—wise and ready to lead kindly!" },
    { name: "Barnabas",
      traits: ["kind", "teacher", "joyful", "faithful"],
      reference: "Acts 4 — Known as the “son of encouragement.”",
      whyMatch: "You're an encourager like Barnabas—spreading joy and kindness!" },
    { name: "Mary",
      traits: ["humble", "faithful", "kind", "wise"],
      reference: "Luke 1 — Trusted God with a humble heart.",
      whyMatch: "You're humble and kind like Mary—trusting God with a gentle spirit!" },
    { name: "Noah",
      traits: ["faithful", "resilient", "protective", "brave"],
      reference: "Genesis 6–9 — Built the ark and cared for creation.",
      whyMatch: "You're protective like Noah—faithful and brave in big projects!" },
    { name: "Joshua",
      traits: ["brave", "adventurous", "faithful", "protective"],
      reference: "Joshua 1 — Be strong and courageous!",
      whyMatch: "You're adventurous like Joshua—brave in new places and challenges!" },
    { name: "Miriam",
      traits: ["joyful", "creative", "brave", "teacher"],
      reference: "Exodus 15 — Led singing after a great rescue.",
      whyMatch: "You're joyful like Miriam—creative and ready to cheer others on!" },
    { name: "Gideon",
      traits: ["brave", "humble", "faithful", "resilient", "protective"],
      reference: "Judges 6–7 — Learned to be brave with God's help.",
      whyMatch: "You're humble but brave like Gideon—growing stronger step by step!" },
    { name: "Priscilla",
      traits: ["teacher", "wise", "brave", "kind"],
      reference: "Acts 18 — Taught others with wisdom and love.",
      whyMatch: "You're a helper like Priscilla—teaching kindly and wisely!" },
    { name: "Tabitha (Dorcas)",
      traits: ["kind", "creative", "faithful", "humble"],
      reference: "Acts 9 — Known for good works and caring gifts.",
      whyMatch: "You're caring like Tabitha—using your creativity to help people!" },
    { name: "Paul",
      traits: ["adventurous", "teacher", "faithful", "brave", "resilient"],
      reference: "Philippians 4:13 — I can do all things through Christ.",
      whyMatch: "You're bold like Paul—adventurous and eager to share good news!" }
  ];

  // ---------- Helpers ----------
  const slugify = (str) =>
    str.toLowerCase()
       .replace(/\(.*?\)/g, "")     // remove parentheses content
       .replace(/[^a-z0-9\s-]/g, "") // remove punctuation
       .trim()
       .replace(/\s+/g, "-");

  const imagePathFor = (name) => `images/${slugify(name)}.png`;

  // ---------- UI Flow ----------
  startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";
    resultSection.style.display = "none";
    quizSection.style.display = "block";
  });

  submitQuiz.addEventListener("click", () => {
    const formData = new FormData(quizForm);
    const answers = [formData.get("q1"), formData.get("q2"), formData.get("q3")].filter(Boolean);

    if (answers.length < 3) {
      alert("Please answer all questions!");
      return;
    }

    // Find best match by overlapping traits
    let bestMatch = characters[0];
    let maxScore = -1;

    characters.forEach(c => {
      const score = answers.filter(t => c.traits.includes(t)).length;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = c;
      }
    });

    // Render result (with local image + fallback)
    quizSection.style.display = "none";
    resultSection.style.display = "block";

    const imgSrc = imagePathFor(bestMatch.name);
    resultText.innerHTML = `
      <div class="card">
        <img src="${imgSrc}" alt="${bestMatch.name}"
             onerror="this.onerror=null;this.src='placeholder_light_gray_block.png';" />
        <h3>${bestMatch.name}</h3>
        <p>${bestMatch.whyMatch}</p>
        <p><em>${bestMatch.reference}</em></p>
      </div>
    `;
  });

  tryAgain.addEventListener("click", () => {
    resultSection.style.display = "none";
    quizSection.style.display = "none";
    startBtn.style.display = "block";
    quizForm.reset();
  });
});
