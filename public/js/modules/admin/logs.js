export function initLogs() {
    const sheetBody = document.getElementById("sheetBody");
    if (!sheetBody) return;

    // You can populate logs dynamically from API
    // Example placeholder:
    sheetBody.innerHTML = `
        <tr>
            <td>1</td>
            <td contenteditable="true">09123456789</td>
            <td contenteditable="true">No Answer</td>
            <td contenteditable="true"></td>
        </tr>
    `;
}
