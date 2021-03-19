import PriorityQueue from "priorityqueuejs"
import uniq from "lodash/uniq"

type Terminal = [term: string, freq: number]

export type Trie = {
  freq: number
  terminals: Record<string, number>
  children: {
    [c: string]: Trie | null
  }
}
export function newTrie(): Trie {
  return { freq: 0, children: {}, terminals: {} }
}
export function addString(
  trie: Trie,
  searchString: string,
  terminalString: string,
  freq: number,
) {
  let node = trie
  node.freq += freq
  for (let i = 0; i < searchString.length; i++) {
    const char = searchString[i]
    let child = node.children[char]
    if (!child) {
      child = node.children[char] = newTrie()
    }
    child.freq += freq
    node = child
  }
  if (terminalString in node.terminals) {
    node.terminals[terminalString] += freq
  } else {
    node.terminals[terminalString] = freq
  }
}
export function getFrequency(trie: Trie, searchString: string) {
  let node = trie
  for (let i = 0; i < searchString.length; i++) {
    const char = searchString[i]
    let child = node.children[char]
    if (!child) {
      return 0
    }
    node = child
  }
  return node.freq
}

export function findMostFrequent(trie: Trie, searchString: string, n: number) {
  let node = trie
  for (let i = 0; i < searchString.length; i++) {
    const char = searchString[i]
    let child = node.children[char]
    if (!child) {
      return []
    }
    node = child
  }
  const terminals = findAllTerminals(node)
  terminals.sort(([_, a], [__, b]) => b - a)
  return (
    terminals
      // dedupe
      .filter(([val], i) => (terminals[i - 1] || [])[0] !== val)
      .slice(0, n)
      .map(([val]) => val)
  )
}

function findAllTerminals(node: Trie, result: Terminal[] = []) {
  if (node.terminals.length) {
    result.push(...Object.entries(node.terminals))
  }
  for (const k of Object.keys(node.children)) {
    findAllTerminals(node.children[k]!, result)
  }

  return result
}

function swapChars(s: string, i: number, j: number) {
  const chars = s.split("")
  const tmp = chars[i]
  chars[i] = chars[j]
  chars[j] = tmp
  return chars.join("")
}

function _fuzzySearch(
  node: Trie,
  searchString: string,
  fuzz: number,
  index = 0,
  result: Trie[] = [],
) {
  if (!node) return result
  if (index === searchString.length) {
    result.push(node)
    return result
  }
  const char = searchString[index]
  const child = node.children[char]
  if (child) {
    _fuzzySearch(child, searchString, fuzz, index + 1, result)
  }
  if (fuzz === 0) {
    return result
  }
  // assume extra char was typed
  _fuzzySearch(node, searchString, fuzz - 1, index + 1, result)
  for (const c of Object.keys(node.children)) {
    // assume char was missed out
    _fuzzySearch(node.children[c]!, searchString, fuzz - 1, index, result)
    // assume char was wrong char
    _fuzzySearch(node.children[c]!, searchString, fuzz - 1, index + 1, result)
  }
  // assume char was swapped with next char
  const swappedString = swapChars(searchString, index, index + 1)
  _fuzzySearch(node, swappedString, fuzz - 1, index, result)
  return result
}

function findNMostLikelyTerminals(node: Trie, n: number) {
  // queue of trie nodes with highest freq first
  const queue = new PriorityQueue<Trie | Terminal>((a, b) => {
    const freqA = Array.isArray(a) ? a[1] : a.freq
    const freqB = Array.isArray(b) ? b[1] : b.freq
    return freqB - freqA
  })
  queue.enq(node)
  const results: Terminal[] = []
  while (results.length < n && !queue.isEmpty()) {
    const next = queue.deq()
    if (Array.isArray(next)) {
      results.push(next)
    } else {
      for (const k of Object.keys(next.children)) {
        const child = next.children[k]!
        queue.enq(child)
      }
      for (const terminal of Object.entries(next.terminals)) {
        queue.enq(terminal)
      }
    }
  }
  return results
}

export function fuzzySearch(
  node: Trie,
  searchString: string,
  fuzz: number,
  n: number,
) {
  const nodes = _fuzzySearch(node, searchString, fuzz)
  const terminals: Array<Terminal> = []
  for (const searchNode of nodes) {
    terminals.push(...findNMostLikelyTerminals(searchNode, n))
  }
  terminals.sort(([, a], [, b]) => b - a)
  return uniq(
    // dedupe
    terminals.map(([val]) => val),
  ).slice(0, n)
}

export function findExact(node: Trie, query: string) {
  while (node && query.length) {
    node = node.children[query[0]]!
    query = query.slice(1)
    if (query.length === 0 && node) {
      return node.terminals
    }
  }
  return []
}
