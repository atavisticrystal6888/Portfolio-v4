export interface LabIdea {
  id: number;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | string;
  problem: string;
  pmSkill: string;
  hardestTech: string;
  stack: string[];
  artifacts: string;
}
