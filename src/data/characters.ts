export interface ChessCharacter {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bonus: string;
  color: string;
  initials: string;
}

export const CHESS_CHARACTERS: ChessCharacter[] = [
  { id: 'lionel', name: 'Lionel', role: 'O Visionário', specialty: 'Leitura de diagonais', bonus: '+10% de precisão em bispos', color: '#38bdf8', initials: 'L' },
  { id: 'cristiano', name: 'Cristiano', role: 'O Incansável', specialty: 'Pressão constante', bonus: '+10% de energia após capturas', color: '#22c55e', initials: 'C' },
  { id: 'magnus', name: 'Magnus', role: 'O Calculista', specialty: 'Finais complexos', bonus: '+12% de avaliação em finais', color: '#a78bfa', initials: 'M' },
  { id: 'judit', name: 'Judit', role: 'A Tática', specialty: 'Ataques surpresa', bonus: '+8% de força em garfos', color: '#f472b6', initials: 'J' },
  { id: 'bobby', name: 'Bobby', role: 'O Clássico', specialty: 'Desenvolvimento rápido', bonus: '+1 defesa no início da partida', color: '#f59e0b', initials: 'B' },
  { id: 'garry', name: 'Garry', role: 'O Agressivo', specialty: 'Iniciativa', bonus: '+10% de pressão no centro', color: '#ef4444', initials: 'G' },
  { id: 'hou', name: 'Hou', role: 'A Estrategista', specialty: 'Controle posicional', bonus: '+10% de controle de território', color: '#fb7185', initials: 'H' },
  { id: 'anand', name: 'Anand', role: 'O Relâmpago', specialty: 'Jogadas velozes', bonus: '+15% de tempo no relógio', color: '#06b6d4', initials: 'A' },
  { id: 'capablanca', name: 'Capablanca', role: 'O Elegante', specialty: 'Simplicidade', bonus: '+10% em trocas favoráveis', color: '#eab308', initials: 'C' },
  { id: 'nona', name: 'Nona', role: 'A Artista', specialty: 'Criatividade', bonus: '+8% de surpresa em movimentos', color: '#c084fc', initials: 'N' },
];
