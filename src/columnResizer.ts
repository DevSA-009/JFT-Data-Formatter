// src/columnResizer.ts
export class ColumnResizer {
  initializeResizing(): void {
    document
      .querySelectorAll<HTMLTableElement>(".resizable-table")
      .forEach((table) => {
        table
          .querySelectorAll<HTMLTableHeaderCellElement>("th")
          .forEach((th) => {
            const resizer = document.createElement("div");
            Object.assign(resizer.style, {
              position: "absolute",
              top: "0",
              right: "0",
              width: "5px",
              height: "100%",
              cursor: "col-resize",
              userSelect: "none",
              zIndex: "1",
            });

            resizer.addEventListener("mousedown", (e: MouseEvent) => {
              e.preventDefault();
              const startX = e.pageX,
                startWidth = th.offsetWidth;

              const move = (e: MouseEvent) =>
                (th.style.width = startWidth + (e.pageX - startX) + "px");
              const up = () => {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
              };

              document.addEventListener("mousemove", move);
              document.addEventListener("mouseup", up);
            });

            th.appendChild(resizer);
          });
      });
  }
}
