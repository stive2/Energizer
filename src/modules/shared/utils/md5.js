/**
 * MD5 — implémentation conservée pour la compatibilité avec l'ancienne page JSP
 * (Sapelli / Energizer) qui s'attend à recevoir un mot de passe haché MD5
 * dans le champ caché `password` du formulaire `userloginmid.jsp`.
 *
 * NB. MD5 n'est plus considéré comme sûr cryptographiquement ; ce module est
 * fourni uniquement pour préserver le contrat existant avec le backend.
 *
 * Source dérivée du fichier legacy `lib/securepass.js`.
 */

const HEX_CHARS = '0123456789abcdef'

function hex(i) {
  let h = ''
  for (let j = 0; j <= 3; j += 1) {
    h +=
      HEX_CHARS.charAt((i >> (j * 8 + 4)) & 0x0f) +
      HEX_CHARS.charAt((i >> (j * 8)) & 0x0f)
  }
  return h
}

function add(x, y) {
  return ((x & 0x7fffffff) + (y & 0x7fffffff)) ^ (x & 0x80000000) ^ (y & 0x80000000)
}

function rot(q, s) {
  return (q << s) | (q >>> (32 - s))
}

function r1(A, B, C, D, X, S, T) {
  const q = add(add(A, (B & C) | (~B & D)), add(X, T))
  return add(rot(q, S), B)
}

function r2(A, B, C, D, X, S, T) {
  const q = add(add(A, (B & D) | (C & ~D)), add(X, T))
  return add(rot(q, S), B)
}

function r3(A, B, C, D, X, S, T) {
  const q = add(add(A, B ^ C ^ D), add(X, T))
  return add(rot(q, S), B)
}

function r4(A, B, C, D, X, S, T) {
  const q = add(add(A, C ^ (B | ~D)), add(X, T))
  return add(rot(q, S), B)
}

/**
 * Calcule l'empreinte MD5 (hex minuscule) d'une chaîne UTF-8 simple.
 * @param {string} input
 * @returns {string} 32 caractères hexadécimaux.
 */
export function calcMD5(input) {
  const sInp = String(input ?? '')
  const wLen = (((sInp.length + 8) >> 6) + 1) << 4
  const X = new Array(wLen)
  let i
  let j = 4

  for (i = 0; i * 4 < sInp.length; i += 1) {
    X[i] = 0
    for (j = 0; j < 4 && j + i * 4 < sInp.length; j += 1) {
      X[i] += sInp.charCodeAt(j + i * 4) << (j * 8)
    }
  }

  if (j === 4) {
    X[i] = 0x80
    i += 1
  } else {
    X[i - 1] += 0x80 << (j * 8)
  }
  for (; i < wLen; i += 1) X[i] = 0
  X[wLen - 2] = sInp.length * 8

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  for (i = 0; i < wLen; i += 16) {
    const aO = a
    const bO = b
    const cO = c
    const dO = d

    a = r1(a, b, c, d, X[i + 0], 7, 0xd76aa478)
    d = r1(d, a, b, c, X[i + 1], 12, 0xe8c7b756)
    c = r1(c, d, a, b, X[i + 2], 17, 0x242070db)
    b = r1(b, c, d, a, X[i + 3], 22, 0xc1bdceee)
    a = r1(a, b, c, d, X[i + 4], 7, 0xf57c0faf)
    d = r1(d, a, b, c, X[i + 5], 12, 0x4787c62a)
    c = r1(c, d, a, b, X[i + 6], 17, 0xa8304613)
    b = r1(b, c, d, a, X[i + 7], 22, 0xfd469501)
    a = r1(a, b, c, d, X[i + 8], 7, 0x698098d8)
    d = r1(d, a, b, c, X[i + 9], 12, 0x8b44f7af)
    c = r1(c, d, a, b, X[i + 10], 17, 0xffff5bb1)
    b = r1(b, c, d, a, X[i + 11], 22, 0x895cd7be)
    a = r1(a, b, c, d, X[i + 12], 7, 0x6b901122)
    d = r1(d, a, b, c, X[i + 13], 12, 0xfd987193)
    c = r1(c, d, a, b, X[i + 14], 17, 0xa679438e)
    b = r1(b, c, d, a, X[i + 15], 22, 0x49b40821)

    a = r2(a, b, c, d, X[i + 1], 5, 0xf61e2562)
    d = r2(d, a, b, c, X[i + 6], 9, 0xc040b340)
    c = r2(c, d, a, b, X[i + 11], 14, 0x265e5a51)
    b = r2(b, c, d, a, X[i + 0], 20, 0xe9b6c7aa)
    a = r2(a, b, c, d, X[i + 5], 5, 0xd62f105d)
    d = r2(d, a, b, c, X[i + 10], 9, 0x02441453)
    c = r2(c, d, a, b, X[i + 15], 14, 0xd8a1e681)
    b = r2(b, c, d, a, X[i + 4], 20, 0xe7d3fbc8)
    a = r2(a, b, c, d, X[i + 9], 5, 0x21e1cde6)
    d = r2(d, a, b, c, X[i + 14], 9, 0xc33707d6)
    c = r2(c, d, a, b, X[i + 3], 14, 0xf4d50d87)
    b = r2(b, c, d, a, X[i + 8], 20, 0x455a14ed)
    a = r2(a, b, c, d, X[i + 13], 5, 0xa9e3e905)
    d = r2(d, a, b, c, X[i + 2], 9, 0xfcefa3f8)
    c = r2(c, d, a, b, X[i + 7], 14, 0x676f02d9)
    b = r2(b, c, d, a, X[i + 12], 20, 0x8d2a4c8a)

    a = r3(a, b, c, d, X[i + 5], 4, 0xfffa3942)
    d = r3(d, a, b, c, X[i + 8], 11, 0x8771f681)
    c = r3(c, d, a, b, X[i + 11], 16, 0x6d9d6122)
    b = r3(b, c, d, a, X[i + 14], 23, 0xfde5380c)
    a = r3(a, b, c, d, X[i + 1], 4, 0xa4beea44)
    d = r3(d, a, b, c, X[i + 4], 11, 0x4bdecfa9)
    c = r3(c, d, a, b, X[i + 7], 16, 0xf6bb4b60)
    b = r3(b, c, d, a, X[i + 10], 23, 0xbebfbc70)
    a = r3(a, b, c, d, X[i + 13], 4, 0x289b7ec6)
    d = r3(d, a, b, c, X[i + 0], 11, 0xeaa127fa)
    c = r3(c, d, a, b, X[i + 3], 16, 0xd4ef3085)
    b = r3(b, c, d, a, X[i + 6], 23, 0x04881d05)
    a = r3(a, b, c, d, X[i + 9], 4, 0xd9d4d039)
    d = r3(d, a, b, c, X[i + 12], 11, 0xe6db99e5)
    c = r3(c, d, a, b, X[i + 15], 16, 0x1fa27cf8)
    b = r3(b, c, d, a, X[i + 2], 23, 0xc4ac5665)

    a = r4(a, b, c, d, X[i + 0], 6, 0xf4292244)
    d = r4(d, a, b, c, X[i + 7], 10, 0x432aff97)
    c = r4(c, d, a, b, X[i + 14], 15, 0xab9423a7)
    b = r4(b, c, d, a, X[i + 5], 21, 0xfc93a039)
    a = r4(a, b, c, d, X[i + 12], 6, 0x655b59c3)
    d = r4(d, a, b, c, X[i + 3], 10, 0x8f0ccc92)
    c = r4(c, d, a, b, X[i + 10], 15, 0xffeff47d)
    b = r4(b, c, d, a, X[i + 1], 21, 0x85845dd1)
    a = r4(a, b, c, d, X[i + 8], 6, 0x6fa87e4f)
    d = r4(d, a, b, c, X[i + 15], 10, 0xfe2ce6e0)
    c = r4(c, d, a, b, X[i + 6], 15, 0xa3014314)
    b = r4(b, c, d, a, X[i + 13], 21, 0x4e0811a1)
    a = r4(a, b, c, d, X[i + 4], 6, 0xf7537e82)
    d = r4(d, a, b, c, X[i + 11], 10, 0xbd3af235)
    c = r4(c, d, a, b, X[i + 2], 15, 0x2ad7d2bb)
    b = r4(b, c, d, a, X[i + 9], 21, 0xeb86d391)

    a = add(a, aO)
    b = add(b, bO)
    c = add(c, cO)
    d = add(d, dO)
  }

  return hex(a) + hex(b) + hex(c) + hex(d)
}

export default calcMD5
