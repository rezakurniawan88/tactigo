export const dataFormations = {
    "4-3-3": "4-3-3 (Classic)",
    "4-4-2": "4-4-2 (Diamond)",
    "3-5-2": "3-5-2 (Wing Backs)",
    "4-2-3-1": "4-2-3-1 (Modern)",
    "5-3-2": "5-3-2 (Defensive)",
    "custom": "Custom"
} as const;

export const formationPositions = {
  "4-3-3": {
    horizontal: [
      { left: 50, top: 240 },   // GK
      { left: 170, top: 160 },  // CB
      { left: 170, top: 330 },  // CB
      { left: 270, top: 60 },   // LB
      { left: 270, top: 420 },  // RB
      { left: 400, top: 160 },  // CDM
      { left: 400, top: 320 },  // CDM
      { left: 550, top: 240 },  // CAM
      { left: 700, top: 100 },  // LW
      { left: 700, top: 380 },  // RW
      { left: 800, top: 240 },  // CF
    ],
    vertical: [
      { left: 240, top: 50 },   // GK
      { left: 160, top: 170 },  // CB
      { left: 330, top: 170 },  // CB
      { left: 60,  top: 270 },  // LB
      { left: 420, top: 270 },  // RB
      { left: 160, top: 400 },  // CDM
      { left: 320, top: 400 },  // CDM
      { left: 240, top: 550 },  // CAM
      { left: 100, top: 700 },  // LW
      { left: 380, top: 700 },  // RW
      { left: 240, top: 800 },  // CF
    ]
  },
  "4-4-2": {
    horizontal: [
      { left: 50, top: 240 },
      { left: 170, top: 160 },
      { left: 170, top: 330 },
      { left: 270, top: 60 },
      { left: 270, top: 420 },
      { left: 450, top: 150 },
      { left: 450, top: 340 },
      { left: 600, top: 60 },
      { left: 600, top: 420 },
      { left: 750, top: 160 },
      { left: 750, top: 320 },
    ],
    vertical: [
      { left: 240, top: 50 },
      { left: 160, top: 170 },
      { left: 330, top: 170 },
      { left: 60,  top: 270 },
      { left: 420, top: 270 },
      { left: 150, top: 450 },
      { left: 340, top: 450 },
      { left: 60,  top: 600 },
      { left: 420, top: 600 },
      { left: 160, top: 750 },
      { left: 320, top: 750 },
    ]
  },
  "3-5-2": {
    horizontal: [
      { left: 50, top: 240 },
      { left: 170, top: 120 },
      { left: 170, top: 240 },
      { left: 170, top: 360 },
      { left: 480, top: 60 },
      { left: 480, top: 420 },
      { left: 400, top: 160 },
      { left: 400, top: 320 },
      { left: 550, top: 240 },
      { left: 750, top: 160 },
      { left: 750, top: 320 },
    ],
    vertical: [
      { left: 240, top: 50 },
      { left: 120, top: 170 },
      { left: 240, top: 170 },
      { left: 360, top: 170 },
      { left: 60,  top: 480 },
      { left: 420, top: 480 },
      { left: 160, top: 400 },
      { left: 320, top: 400 },
      { left: 240, top: 550 },
      { left: 160, top: 750 },
      { left: 320, top: 750 },
    ]
  },
  "4-2-3-1": {
    horizontal: [
      { left: 50, top: 240 },
      { left: 170, top: 160 },
      { left: 170, top: 330 },
      { left: 270, top: 60 },
      { left: 270, top: 420 },
      { left: 400, top: 160 },
      { left: 400, top: 320 },
      { left: 600, top: 100 },
      { left: 600, top: 240 },
      { left: 600, top: 380 },
      { left: 750, top: 240 },
    ],
    vertical: [
      { left: 240, top: 50 },
      { left: 160, top: 170 },
      { left: 330, top: 170 },
      { left: 60,  top: 270 },
      { left: 420, top: 270 },
      { left: 160, top: 400 },
      { left: 320, top: 400 },
      { left: 100, top: 600 },
      { left: 240, top: 600 },
      { left: 380, top: 600 },
      { left: 240, top: 750 },
    ]
  },
  "5-3-2": {
    horizontal: [
      { left: 50, top: 240 },
      { left: 170, top: 120 },
      { left: 170, top: 240 },
      { left: 170, top: 360 },
      { left: 300, top: 40 },
      { left: 300, top: 440 },
      { left: 450, top: 120 },
      { left: 450, top: 240 },
      { left: 450, top: 360 },
      { left: 750, top: 160 },
      { left: 750, top: 320 },
    ],
    vertical: [
      { left: 240, top: 50 },
      { left: 120, top: 170 },
      { left: 240, top: 170 },
      { left: 360, top: 170 },
      { left: 40,  top: 300 },
      { left: 440, top: 300 },
      { left: 120, top: 450 },
      { left: 240, top: 450 },
      { left: 360, top: 450 },
      { left: 160, top: 750 },
      { left: 320, top: 750 },
    ]
  }
} as const;

export const defaultOpponents = {
  horizontal: [
      { id: 1, x: 850, y: 240, color: '#F44336', initialX: 850, initialY: 240, number: 1 },
      { id: 2, x: 750, y: 180, color: '#F44336', initialX: 750, initialY: 180, number: 2 },
      { id: 3, x: 750, y: 310, color: '#F44336', initialX: 750, initialY: 310, number: 3 },
      { id: 4, x: 650, y: 60, color: '#F44336', initialX: 650, initialY: 60, number: 4 },
      { id: 5, x: 650, y: 420, color: '#F44336', initialX: 650, initialY: 420, number: 5 },
      { id: 6, x: 490, y: 150, color: '#F44336', initialX: 490, initialY: 150, number: 6 },
      { id: 7, x: 490, y: 330, color: '#F44336', initialX: 490, initialY: 330, number: 7 },
      { id: 8, x: 380, y: 245, color: '#F44336', initialX: 380, initialY: 245, number: 8 },
      { id: 9, x: 200, y: 110, color: '#F44336', initialX: 200, initialY: 110, number: 9 },
      { id: 10, x: 200, y: 380, color: '#F44336', initialX: 200, initialY: 380, number: 10 },
      { id: 11, x: 100, y: 245, color: '#F44336', initialX: 100, initialY: 245, number: 11 },
  ],
  vertical: [
    { id: 1, x: 240, y: 850, color: '#F44336', initialX: 240, initialY: 850, number: 1 },
    { id: 2, x: 180, y: 750, color: '#F44336', initialX: 180, initialY: 750, number: 2 },
    { id: 3, x: 310, y: 750, color: '#F44336', initialX: 310, initialY: 750, number: 3 },
    { id: 4, x: 60, y: 650, color: '#F44336', initialX: 60, initialY: 650, number: 4 },
    { id: 5, x: 420, y: 650, color: '#F44336', initialX: 420, initialY: 650, number: 5 },
    { id: 6, x: 150, y: 490, color: '#F44336', initialX: 150, initialY: 490, number: 6 },
    { id: 7, x: 330, y: 490, color: '#F44336', initialX: 330, initialY: 490, number: 7 },
    { id: 8, x: 245, y: 380, color: '#F44336', initialX: 245, initialY: 380, number: 8 },
    { id: 9, x: 110, y: 200, color: '#F44336', initialX: 110, initialY: 200, number: 9 },
    { id: 10, x: 380, y: 200, color: '#F44336', initialX: 380, initialY: 200, number: 10 },
    { id: 11, x: 245, y: 100, color: '#F44336', initialX: 245, initialY: 100, number: 11 },
  ]
}