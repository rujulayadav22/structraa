document.addEventListener("DOMContentLoaded", () => {

    /* ================= NAVIGATION ================= */

    
window.goToConvertText = () => {
    window.location.href = "Structra3.html";
};

window.goToConvertInstructions = () => {
    window.location.href = "Structra2.html";
};

window.goToUploadImage = () => {
    window.location.href = "Structra4.html";
};

window.goBack = () => {
    window.location.href = "index.html";
};

    /* ================= CONVERT TEXT PAGE ================= */

    const textarea = document.getElementById("inputText");
    const textCounter = document.querySelector(".char-count");

    if (textarea && textCounter) {
        textarea.addEventListener("input", () => {
            textCounter.textContent = `${textarea.value.length} / 5000`;
        });

        window.clearText = () => {
            textarea.value = "";
            textCounter.textContent = "0 / 5000";
        };

        window.convertText = () => {
            const input = textarea.value.trim();
            const outputList = document.getElementById("outputList");
            outputList.innerHTML = "";

            if (!input) {
                outputList.innerHTML =
                    "<li>Please paste some instructions first.</li>";
                return;
            }

            let steps = input
                .split(/[.\n?]/)
                .map(step => step.trim())
                .filter(Boolean)
                .map(step =>
                    step.replace(/^(then|after that|finally|next|now)\s+/i, "")
                )
                .slice(0, 10);

            steps.forEach(step => {
                const li = document.createElement("li");
                li.textContent = step;
                outputList.appendChild(li);
            });
        };
    }


    /* ================= IMAGE UPLOAD & OCR ================= */

    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const outputText = document.getElementById("outputText");
    const ocrCounter = document.getElementById("counter");

    if (imageInput) {
        imageInput.addEventListener("change", () => {
            const file = imageInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                imagePreview.src = reader.result;
                imagePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        });
    }

    window.extractText = () => {
        if (!imageInput || !imageInput.files[0]) {
            alert("Please choose an image first");
            return;
        }

        const file = imageInput.files[0];
        outputText.value = "Extracting text...";
        ocrCounter.textContent = "Processing...";

        Tesseract.recognize(file, "eng", {
            logger: info => console.log(info)
        })
        .then(({ data: { text } }) => {
            const cleanedText = cleanOCRText(text);
            outputText.value = cleanedText;
            ocrCounter.textContent = `${cleanedText.length} / 5000`;
        })
        .catch(err => {
            console.error(err);
            outputText.value = "Failed to extract text.";
            ocrCounter.textContent = "0 / 5000";
        });
    };

});


/* ================= OCR TEXT CLEANER ================= */

function cleanOCRText(text) {
    let cleaned = text;

    // Remove junk symbols
    cleaned = cleaned.replace(/[|=]/g, "");

    // Remove random single numbers
    cleaned = cleaned.replace(/\b\d+\b/g, "");

    // Remove known garbage words
    cleaned = cleaned.replace(/\b(LLL|FT|Insta)\b/gi, "");

    // Fix common OCR mistakes
    const fixes = {
        "Setings": "Settings",
        "Mmeny": "Menu",
        "Openthe": "Open the",
        "Submitthe": "Submit the",
        "UploadYour": "Upload Your"
    };

    for (let wrong in fixes) {
        cleaned = cleaned.replace(new RegExp(wrong, "gi"), fixes[wrong]);
    }

    // Add space between joined words
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Normalize punctuation
    cleaned = cleaned
        .replace(/\s+([.,:?])/g, "$1")
        .replace(/[,:]\s*(\n|$)/g, "$1");

    // Normalize spacing
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Improve structure
    cleaned = cleaned.replace(/Steps to Complete/gi, "\nSteps to Complete\n");

    cleaned = cleaned.replace(
        /(Open the|Enable|Upload|Submit|Wait|Plug|Test)/g,
        "\n$1"
    );

    cleaned = cleaned.replace(/\n+/g, "\n").trim();

    return cleaned;
}

