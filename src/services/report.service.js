import PDFDocument from "pdfkit";
import fs from "fs";

export function generateLeaderboardPDF(data) {
    const doc = new PDFDocument();
    const filePath = `reports/leaderboard-${Date.now()}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text("Performance Leaderboard", { align: "center" });
    doc.moveDown();

    data.forEach((user, index) => {
        doc.fontSize(12).text(
            `${index + 1}. ${user.username} - Score: ${user.aiScore}`
        );
    });

    doc.end();
    return filePath;
}
