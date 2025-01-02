// validation.js (exemple Node.js Express)

const express = require('express');
const app = express();
app.use(express.json());

// Liste de jours fériés (2025)
const holidays2025 = [
  "2025-01-01", // Jour de l'an
  "2025-04-21", // Lundi de Pâques (exemple)
  "2025-05-01", // Jour du travail
  "2025-05-08", // Victoire 1945
  "2025-06-09", // Lundi de Pentecôte
  "2025-07-14", // Fête nationale
  "2025-08-15", // Assomption
  "2025-11-01", // Toussaint
  "2025-11-11", // Toussaint
  "2025-12-25", // Jour de Noël 
];

app.post('/validateDate', (req, res) => {
  // 1) Récupère la data envoyée par Make
  // Suppose qu'on reçoit { "start": "2025-06-06T19:00:00" }
  const { start } = req.body;

  // 2) Convertir en date
  let startDt = new Date(start);
  let isValid = true;
  let reason = '';

  // 3) Vérifier si c'est >= date actuelle
  let now = new Date("2025-06-01T00:00:00"); 
  if (startDt < now) {
    isValid = false;
    reason = 'Date is in the past.';
    // Optionnel: on peut corriger, ex. startDt = now;
  }

  // 4) Vérifier weekend
  let day = startDt.getDay(); // 0=Dim, 6=Sam
  if (day === 0 || day === 6) {
    isValid = false;
    reason = 'Weekend not allowed.';
    // Option: on corrige => passer au lundi suivant
  }

  // 5) Vérifier heure (9h30–17h30)
  let hour = startDt.getHours();
  let minute = startDt.getMinutes();
  // En gros, on n'accepte que 9h30 <= time < 17h30
  let tooEarly = (hour < 9) || (hour === 9 && minute < 30);
  let tooLate  = (hour > 17) || (hour === 17 && minute > 30);
  if (tooEarly || tooLate) {
    isValid = false;
    reason = 'Out of working hours.';
    // Option: corriger => ex. startDt = 9h30 du jour
  }

  // 6) Vérifier jour férié
  let isoDate = startDt.toISOString().slice(0,10); // ex. '2025-07-14'
  if (holidays2025.includes(isoDate)) {
    isValid = false;
    reason = 'Holiday not allowed.';
    // Option: passer au lendemain
  }

  // 7) Si isValid=false mais tu veux auto-corriger => fais-le ici
  // Par ex. si c'est 19h, tu passes à 9h30 le lendemain
  // ...
  // Pour simplifier, je renvoie isValid=false

  // 8) Calculer end (durée 30min) si besoin
  let endDt = new Date(startDt.getTime() + 30 * 60000); 

  // 9) Formater en ISO
  let correctedStart = startDt.toISOString();  // '2025-06-06T19:00:00.000Z'
  let correctedEnd   = endDt.toISOString();

  // 10) Réponse JSON
  res.json({
    isValid,
    reason,
    correctedStart,
    correctedEnd
  });
});

app.listen(3000, () => {
  console.log('Validation script running on port 3000');
});
