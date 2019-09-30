// JS implementation of Java's hashCode.
// https://stackoverflow.com/questions/194846/is-there-any-kind-of-hash-code-function-in-javascript
const stringHashCode = function(value){
    let hash = 0;
    for (var i = 0; i < value.length; i++) {
        const character = value.charCodeAt(i);
        hash = ((hash<<5)-hash)+character * 13;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

const toHexByte = function(value) {
  let result = value.toString(16);
  if (result.length < 2) {
    result = `0${result}`;
  }
  return result;
}

const nameToColor = function(name) {
  let hashCode = stringHashCode(name);
  if (hashCode < 0) {
    hashCode *= -1;
  }
  const R = toHexByte(Math.floor(((hashCode >> 16) & 0xFF) / 0xFF * 0xBF + 0x20));
  const G = toHexByte(Math.floor(((hashCode >> 8) & 0xFF) / 0xBF * 0xBF + 0x20));
  const B = toHexByte(Math.floor((hashCode & 0xFF) / 0xFF * 0xBF + 0x20));
  return `#${R}${G}${B}`
}

export {
  nameToColor,
};

