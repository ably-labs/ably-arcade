export class Scoreboard {

  private items: { name: string; score: number; }[];
  private cap: number;

  public get scores(): { name: string; score: number; }[] {
    return this.items;
  }

  constructor(items: { name: string; score: number; }[] = null, cap: number = 10) {
    this.items = [];
    this.cap = cap;
    this.addRange(items || []);
  }

  public addRange(items: { name: string; score: number; }[]) {
    this.items.push(...items);
    this.items.sort((a, b) => b.score - a.score);
    this.items = this.items.slice(0, this.cap);
  }
}
