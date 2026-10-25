package com.hotel.system.util;

import java.util.*;

/**
 * Trie (Prefix Tree) data structure for autocomplete suggestions.
 * Features:
 * - Case-insensitive prefix matching
 * - Multi-category indexing (HOTEL, CITY, AMENITY)
 * - Deterministic popularity-ranked results
 * - Prefix search latency < 1ms
 */
public class Trie {

    public static class Suggestion implements Comparable<Suggestion> {
        private final String term;
        private final String category; // e.g. "HOTEL", "CITY", "AMENITY"
        private final long score;
        private final String referenceId; // e.g. hotelId

        public Suggestion(String term, String category, long score, String referenceId) {
            this.term = term;
            this.category = category;
            this.score = score;
            this.referenceId = referenceId;
        }

        public String getTerm() { return term; }
        public String getCategory() { return category; }
        public long getScore() { return score; }
        public String getReferenceId() { return referenceId; }

        @Override
        public int compareTo(Suggestion other) {
            // Higher score first; if equal, alphabetical
            int cmp = Long.compare(other.score, this.score);
            if (cmp != 0) return cmp;
            return this.term.compareToIgnoreCase(other.term);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Suggestion)) return false;
            Suggestion that = (Suggestion) o;
            return term.equalsIgnoreCase(that.term) && Objects.equals(category, that.category);
        }

        @Override
        public int hashCode() {
            return Objects.hash(term.toLowerCase(), category);
        }
    }

    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        Set<Suggestion> suggestions = new TreeSet<>();
    }

    private final TrieNode root = new TrieNode();
    private int totalTermsCount = 0;

    public synchronized void insert(String term, String category, long score, String referenceId) {
        if (term == null || term.trim().isEmpty()) return;
        String clean = term.trim().toLowerCase();
        Suggestion item = new Suggestion(term.trim(), category, score, referenceId);

        TrieNode current = root;
        current.suggestions.add(item);

        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            current = current.children.computeIfAbsent(c, k -> new TrieNode());
            current.suggestions.add(item);
        }
        totalTermsCount++;
    }

    public List<Suggestion> searchPrefix(String prefix, int limit) {
        if (prefix == null || prefix.trim().isEmpty()) {
            // Return top overall suggestions from root
            return getTopSuggestions(root.suggestions, limit);
        }

        String clean = prefix.trim().toLowerCase();
        TrieNode current = root;

        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            TrieNode next = current.children.get(c);
            if (next == null) {
                return Collections.emptyList();
            }
            current = next;
        }

        return getTopSuggestions(current.suggestions, limit);
    }

    private List<Suggestion> getTopSuggestions(Set<Suggestion> set, int limit) {
        List<Suggestion> results = new ArrayList<>();
        int count = 0;
        for (Suggestion s : set) {
            if (count >= limit) break;
            results.add(s);
            count++;
        }
        return results;
    }

    public synchronized void clear() {
        root.children.clear();
        root.suggestions.clear();
        totalTermsCount = 0;
    }

    public int getTotalTermsCount() {
        return totalTermsCount;
    }
}
