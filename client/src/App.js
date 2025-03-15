import React, { useRef } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function App() {
  const tableRef = useRef();

  const generatePDF = async () => {
    const input = tableRef.current;

    // Use html2canvas to render the DOM element
    const canvas = await html2canvas(input, { scale: 2 }); // Scale improves quality
    const imgData = canvas.toDataURL("image/png"); // Convert to image data

    // Use jsPDF to create a PDF and add the image
    const pdf = new jsPDF();
    const imgWidth = 190; // Fit to A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    // Convert the PDF to a Blob for sending to the backend
    const pdfBlob = pdf.output("blob");

    // Prepare the data for the POST request
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "bill.pdf"); // "bill.pdf" is the filename

    try {
      // Send the PDF blob to the server
      const response = await fetch("http://localhost:3001/send-email", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("PDF sent successfully!");
    } catch (error) {
      console.error("Error sending PDF:", error);
    }
  };

  return (
    <div>
      <h1>Table Data</h1>
      {/* Wrap the table in a ref for rendering */}
      <div ref={tableRef} style={{ padding: 20, backgroundColor: "white" }}>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: "Item 1", quantity: 10, price: 20 },
              { id: 2, name: "Item 2", quantity: 5, price: 30 },
              { id: 3, name: "Item 3", quantity: 7, price: 15 },
            ].map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.quantity}</td>
                <td>{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
}

export default App;
