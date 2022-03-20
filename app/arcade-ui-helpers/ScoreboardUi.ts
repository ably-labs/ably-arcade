export class ScoreboardUi {
  private table: HTMLTableElement;
  private rowTemplate: HTMLTemplateElement;

  constructor(tableElementId: string, rowTemplateId: string) {
    this.table = document.getElementById(tableElementId) as HTMLTableElement;
    this.rowTemplate = document.getElementById(rowTemplateId) as HTMLTemplateElement;
  }

  public render(scores: { name: string; score: number; }[]) {
    this.table.tBodies[0].innerHTML = "";

    for (const { name, score } of scores) {
      const tableRow = this.rowTemplate.content.cloneNode(true) as HTMLElement;
      tableRow.querySelector("[data-name]").innerHTML = name;
      tableRow.querySelector("[data-score]").innerHTML = score.toString();
      this.table.tBodies[0].appendChild(tableRow);
    }
  }
}
