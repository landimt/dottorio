/**
 * Subject Colors Enum
 * Cores padronizadas para matérias no sistema Dottorio
 *
 * Estas cores são usadas tanto no frontend quanto no banco de dados
 * para manter consistência visual em toda a aplicação.
 */

// Enum de cores disponíveis para matérias
export enum SubjectColor {
  // Cores quentes
  RED = "red",
  ROSE = "rose",
  PINK = "pink",
  ORANGE = "orange",
  AMBER = "amber",
  YELLOW = "yellow",

  // Cores frias
  GREEN = "green",
  TEAL = "teal",
  CYAN = "cyan",
  BLUE = "blue",
  PURPLE = "purple",
  VIOLET = "violet",

  // Cores neutras
  GRAY = "gray",
  SLATE = "slate",
  WHITE = "white",
}

// Mapeamento de cores para valores hexadecimais
export const SubjectColorHex: Record<SubjectColor, string> = {
  [SubjectColor.RED]: "#F7B29D",
  [SubjectColor.ROSE]: "#FFB4C2",
  [SubjectColor.PINK]: "#F9A8D4",
  [SubjectColor.ORANGE]: "#FDBA74",
  [SubjectColor.AMBER]: "#FCD34D",
  [SubjectColor.YELLOW]: "#FFC857",
  [SubjectColor.GREEN]: "#86EFAC",
  [SubjectColor.TEAL]: "#5EEAD4",
  [SubjectColor.CYAN]: "#67E8F9",
  [SubjectColor.BLUE]: "#A5D6F6",
  [SubjectColor.PURPLE]: "#C9B3F9",
  [SubjectColor.VIOLET]: "#C4B5FD",
  [SubjectColor.GRAY]: "#D1D5DB",
  [SubjectColor.SLATE]: "#CBD5E1",
  [SubjectColor.WHITE]: "#F1F5F9",
};
