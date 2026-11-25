const BASE_URL = "http://127.0.0.1:8000/api";

const ApiClient = {
  async getDrugs() {
    const res = await fetch(`${BASE_URL}/drugs`);
    if (!res.ok) throw new Error("فشل في تحميل قائمة الأدوية");
    return res.json();
  },

  async getPatient(nationalId) {
    const res = await fetch(`${BASE_URL}/patients/${nationalId}`);
    if (!res.ok) throw new Error("السجل غير متوفر لرقم الهوية هذا");
    return res.json();
  },

  async runSimulation(payload) {
    const res = await fetch(`${BASE_URL}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("خطأ أثناء معالجة المحاكاة");
    return res.json();
  }
};