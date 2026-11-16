export const mockMedicalTimeline = [
  {
    id: 'appointment-demo-1',
    type: 'appointment',
    date: '2026-12-10',
    time: '09:30',
    specialty: 'Gastroenterología',
    professional: 'Dra. María González',
    reason: 'Control digestivo',
    status: 'pending',
    notes: '',
  },
  {
    id: 'study-demo-1',
    type: 'study',
    date: '2026-11-03',
    studyType: 'Test de Aire Espirado SIBO H₂/CH₄',
    result: 'Positivo Hidrógeno',
    notes: 'Revisar resultado con gastroenterología.',
    attachment: {
      name: 'test-sibo.pdf',
      fileType: 'pdf',
    },
  },
]
