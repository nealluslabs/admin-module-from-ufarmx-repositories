/**
 * Downloads a file from a Blob object
 * @param blob - The Blob object to download
 * @param filename - The name to give the downloaded file
 */
export const downloadFileFromBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
