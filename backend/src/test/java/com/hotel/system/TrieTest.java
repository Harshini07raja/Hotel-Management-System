package com.hotel.system;

import com.hotel.system.util.Trie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TrieTest {

    @Test
    @DisplayName("Trie inserts terms and retrieves prefix matches case-insensitively")
    public void testPrefixSearch() {
        Trie trie = new Trie();
        trie.insert("Grand Azure Resort", "HOTEL", 980, "HTL-101");
        trie.insert("Grand Hyatt", "HOTEL", 750, "HTL-102");
        trie.insert("Geneva Palace", "HOTEL", 600, "HTL-103");
        trie.insert("Paris", "CITY", 1000, "Paris");

        List<Trie.Suggestion> suggestions = trie.searchPrefix("gra", 5);
        assertEquals(2, suggestions.size());
        // Higher score first: Grand Azure Resort (980) > Grand Hyatt (750)
        assertEquals("Grand Azure Resort", suggestions.get(0).getTerm());
        assertEquals("Grand Hyatt", suggestions.get(1).getTerm());

        // Case-insensitivity test
        List<Trie.Suggestion> upper = trie.searchPrefix("PAR", 5);
        assertEquals(1, upper.size());
        assertEquals("Paris", upper.get(0).getTerm());
    }

    @Test
    @DisplayName("Trie handles empty prefix by returning top overall suggestions")
    public void testEmptyPrefix() {
        Trie trie = new Trie();
        trie.insert("Solaris Mountain Retreat", "HOTEL", 950, "HTL-103");
        trie.insert("Emerald Bay Suites", "HOTEL", 890, "HTL-102");

        List<Trie.Suggestion> top = trie.searchPrefix("", 2);
        assertEquals(2, top.size());
        assertEquals("Solaris Mountain Retreat", top.get(0).getTerm());
    }
}
