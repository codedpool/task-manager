import { render } from "@testing-library/react";
import PDFViewer from "@/components/PDFViewer";

describe("PDFViewer", () => {
  it("renders the pdf iframe appropriately", () => {
    const url = "http://example.com/test.pdf";
    const { container } = render(<PDFViewer url={url} onClose={jest.fn()} />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe(url);
  });
});
