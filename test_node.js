const content = {
  physics: {
    title: 'Physics',
    children: {
      chapter1: {
        title: 'Chapter 1'
      }
    }
  }
};

function getNode(content, pathStr) {
  const parts = pathStr.split('/').filter(p => p.trim() !== '');
  let cur = content;
  for (let i = 0; i < parts.length; i++) {
    const k = parts[i];
    if (!cur || !cur[k]) return null;
    cur = cur[k];
    if (i < parts.length - 1) {
      if (!cur.children) return null;
      cur = cur.children;
    }
  }
  return cur;
}

console.log(getNode(content, 'physics'));
console.log(getNode(content, 'physics/chapter1'));
