export function saveAs(content, fileName) {
  const a = document.createElement('a');
  const isBlob = content.toString().indexOf('Blob') > -1;
  let url = content;
  if (isBlob) {
    url = window.URL.createObjectURL(content);
  }
  a.href = url;
  a.download = fileName;
  a.click();
  if (isBlob) {
    window.URL.revokeObjectURL(url);
  }
}
