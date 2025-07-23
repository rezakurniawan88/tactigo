export const formatDateLastModified = (updatedAt: string) => {
    const now = new Date();
    const modDate = new Date(updatedAt);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const modDateNormalized = new Date(modDate);
    modDateNormalized.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - modDateNormalized.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Last modified today";
    } else if (diffDays === 1) {
        return "Last modified yesterday";
    } else if (diffDays >= 2 && diffDays <= 6) {
        return `Last modified ${diffDays} days ago`;
    } else if (diffDays === 7) {
        return "Last modified 1 week ago";
    } else {
        const day = modDate.getDate().toString().padStart(2, '0');
        const month = (modDate.getMonth() + 1).toString().padStart(2, '0');
        const year = modDate.getFullYear().toString().slice(-2);
        return `Last modified ${day}-${month}-${year}`;
  }
}