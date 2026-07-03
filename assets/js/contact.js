document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("cf-name").value.trim();
    const phone = document.getElementById("cf-phone").value.trim();
    const subject = document.getElementById("cf-subject").value;
    const message = document.getElementById("cf-message").value.trim();

    const text = `Assalam o Alaikum, mera naam ${name} hai (${phone}).\n\nSubject: ${subject}\n\n${message || "Mujhe iske baare mein maloomat chahiye."}`;

    const whatsappUrl = `https://wa.me/923178412757?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  });
});