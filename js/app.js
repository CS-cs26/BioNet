document.addEventListener("DOMContentLoaded", () => {
  let activeDrugs = [];

  const nationalIdInput = document.getElementById("nationalIdInput");
  const fetchBtn = document.getElementById("fetchBtn");
  const patientName = document.getElementById("patientName");
  const patientAge = document.getElementById("patientAge");
  const patientGFR = document.getElementById("patientGFR");
  const patientALT = document.getElementById("patientALT");
  const patientPGx = document.getElementById("patientPGx");
  const dosingIntervalSlider = document.getElementById("dosingIntervalSlider");
  const intervalDisplay = document.getElementById("intervalDisplay");

  const drugsSelect = document.getElementById("drugsSelect");
  const addDrugBtn = document.getElementById("addDrugBtn");
  const medicationsContainer = document.getElementById("medicationsContainer");
  const simulateBtn = document.getElementById("simulateBtn");

  const cpiScore = document.getElementById("cpiScore");
  const cpiBadge = document.getElementById("cpiBadge");
  const renalProgress = document.getElementById("renalProgress");
  const renalLabel = document.getElementById("renalLabel");
  const hepaticProgress = document.getElementById("hepaticProgress");
  const hepaticLabel = document.getElementById("hepaticLabel");
  const recommendationsBox = document.getElementById("recommendationsBox");

  const fhirModal = document.getElementById("fhirModal");
  const fhirModalBtn = document.getElementById("fhirModalBtn");
  const closeFhirModal = document.getElementById("closeFhirModal");
  const fhirCodeViewer = document.getElementById("fhirCodeViewer");

  const autoId = sessionStorage.getItem("autoFetchId");
  if (autoId) {
    nationalIdInput.value = autoId;
    sessionStorage.removeItem("autoFetchId");
    setTimeout(() => fetchBtn.click(), 300);
  }

  dosingIntervalSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    intervalDisplay.textContent = val === "0" ? "جرعة متزامنة (0 ساعة)" : `متباعدة بمقدار (${val} ساعات)`;
    if (activeDrugs.length > 0 && cpiScore.textContent !== "--") {
      simulateBtn.click();
    }
  });

  patientPGx.addEventListener("change", () => {
    if (activeDrugs.length > 0 && cpiScore.textContent !== "--") {
      simulateBtn.click();
    }
  });

  ApiClient.getDrugs().then(drugs => {
    drugsSelect.innerHTML = '<option value="">اختر دواء للإضافة...</option>';
    drugs.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      drugsSelect.appendChild(opt);
    });
  }).catch(err => console.error(err));

  fetchBtn.addEventListener("click", async () => {
    const id = nationalIdInput.value.trim();
    if (!id) return;
    try {
      const patient = await ApiClient.getPatient(id);
      patientName.value = patient.name;
      patientAge.value = patient.age;
      patientGFR.value = patient.gfr;
      patientALT.value = patient.liver_alt;
      if (patient.pgx_profile) patientPGx.value = patient.pgx_profile;
      activeDrugs = [...patient.current_medications];
      renderTags();
    } catch (err) {
      alert(err.message);
    }
  });

  addDrugBtn.addEventListener("click", () => {
    const drug = drugsSelect.value;
    if (drug && !activeDrugs.includes(drug)) {
      activeDrugs.push(drug);
      renderTags();
    }
  });

  function renderTags() {
    medicationsContainer.innerHTML = "";
    activeDrugs.forEach(d => {
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.innerHTML = `<span>${d}</span><span class="close" data-drug="${d}">×</span>`;
      medicationsContainer.appendChild(tag);
    });

    document.querySelectorAll(".tag .close").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const toRemove = e.target.getAttribute("data-drug");
        activeDrugs = activeDrugs.filter(item => item !== toRemove);
        renderTags();
      });
    });
  }

  simulateBtn.addEventListener("click", async () => {
    if (activeDrugs.length === 0) {
      alert("الرجاء إضافة أدوية للتحليل");
      return;
    }

    const payload = {
      patient_id: nationalIdInput.value,
      medications: activeDrugs,
      dosing_interval_hours: parseFloat(dosingIntervalSlider.value),
      bio_twin: {
        age: parseInt(patientAge.value, 10),
        gfr: parseFloat(patientGFR.value),
        liver_alt: parseFloat(patientALT.value),
        pgx_profile: patientPGx.value
      }
    };

    try {
      const data = await ApiClient.runSimulation(payload);
      updateDashboard(data);
    } catch (err) {
      alert(err.message);
    }
  });

  function updateDashboard(res) {
    cpiScore.textContent = res.cumulative_risk_score;
    cpiBadge.className = `badge ${res.risk_level.toLowerCase()}`;
    cpiBadge.textContent = res.risk_level === "CRITICAL" ? "خطر حرج" :
                          res.risk_level === "ELEVATED" ? "خطر مرتفع" : "منظومة مستقرة";

    renalProgress.style.width = `${res.organ_stress.renal_stress_score}%`;
    renalLabel.textContent = `إجهاد الكلى: ${res.organ_stress.renal_stress_score}% (x${res.organ_stress.renal_multiplier})`;

    hepaticProgress.style.width = `${res.organ_stress.hepatic_stress_score}%`;
    hepaticLabel.textContent = `إجهاد الكبد: ${res.organ_stress.hepatic_stress_score}% (x${res.organ_stress.hepatic_multiplier})`;

    GraphVisualizer.render("graphCanvas", res.graph_data);

    recommendationsBox.innerHTML = "";
    if (res.clinical_recommendations.length === 0) {
      recommendationsBox.innerHTML = '<p class="placeholder-text" style="color:var(--success-color)">✓ لم يتم رصد مسار تسمم حرج لهذه التركيبة.</p>';
      return;
    }

    res.clinical_recommendations.forEach(r => {
      const item = document.createElement("div");
      item.className = "rec-item";

      const pillsHtml = r.suggested_alternatives.map(alt => `
        <button class="pill-action-btn" onclick="applyAlternative('${r.critical_drug}', '${alt}')" title="استبدال وتحديث المحاكاة فوراً">
          ⚡ تطبيق بديل: ${alt}
        </button>
      `).join(" ");

      item.innerHTML = `
        <h5>استبدال مقترح للدواء: ${r.critical_drug}</h5>
        <p>${r.reason}</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">${pillsHtml}</div>
      `;
      recommendationsBox.appendChild(item);
    });
  }

  window.applyAlternative = function(oldDrug, newDrug) {
    activeDrugs = activeDrugs.map(d => d === oldDrug ? newDrug : d);
    if (!activeDrugs.includes(newDrug)) {
      activeDrugs.push(newDrug);
    }
    renderTags();
    simulateBtn.click();
  };

  fhirModalBtn.addEventListener("click", async () => {
    const id = nationalIdInput.value.trim();
    if (!id) {
      alert("الرجاء إدخال رقم هوية المريض أولاً لعرض سجل FHIR");
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/patients/${id}/fhir`);
      if (!res.ok) throw new Error("تعذر جلب هيكل FHIR");
      const fhirData = await res.json();
      fhirCodeViewer.textContent = JSON.stringify(fhirData, null, 2);
      fhirModal.style.display = "flex";
    } catch (err) {
      alert(err.message);
    }
  });

  closeFhirModal.addEventListener("click", () => fhirModal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === fhirModal) fhirModal.style.display = "none";
  });
});