// src/imageHandler.ts
import { PLACEHOLDER_IMAGE } from "./types";
import { showToast, getElement } from "./utils";

export class ImageHandler {
  private currentImage: string = PLACEHOLDER_IMAGE;

  get image(): string {
    return this.currentImage;
  }

  displayPreview(src: string): void {
    const preview = getElement("imagePreview");
    if (!preview) return;
    preview.innerHTML = `<img src="${src}" alt="Uploaded Image" />`;
    const section = getElement("imagePreviewSection");
    if (section) section.style.display = "block";
  }

  handleUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.currentImage = result;
          this.displayPreview(result);
          showToast("Image uploaded", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (!blob) continue;
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            this.currentImage = result;
            this.displayPreview(result);
            showToast("Image pasted", "success");
          }
        };
        reader.readAsDataURL(blob);
        event.preventDefault();
        break;
      }
    }
  }

  remove(): void {
    this.currentImage = PLACEHOLDER_IMAGE;
    const preview = getElement("imagePreview");
    const section = getElement("imagePreviewSection");
    const input = getElement<HTMLInputElement>("imageInput");
    if (preview) preview.innerHTML = "";
    if (section) section.style.display = "none";
    if (input) input.value = "";
    showToast("Image removed", "info");
  }

  openSelector(): void {
    const input = getElement<HTMLInputElement>("imageInput");
    if (input) input.click();
  }
}
