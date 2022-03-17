export class AnnouncementUi {
  private element: HTMLElement;

  constructor(elementId: string) {
    this.element = document.getElementById(elementId) as HTMLElement;
  }

  public async displayAll(messages: string[], delay: number) {
    for (const message of messages) {
      await this.display(message, delay);
    }
  }

  public async display(message: string, duration: number) {
    this.element.innerHTML = message;
    await wait(duration);
    this.element.innerHTML = "";
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
