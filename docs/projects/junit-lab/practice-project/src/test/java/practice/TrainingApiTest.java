package practice;

import java.math.BigInteger;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TrainingApiTest {
    private TrainingApi.Counter counter;
    @BeforeEach
    void createFreshCounter() { counter = new TrainingApi.Counter(); }

    @Test void range_belowLower_isFalse() { assertFalse(TrainingApi.inRange(0)); }
    @Test void range_atLower_isTrue() { assertTrue(TrainingApi.inRange(1)); }
    @Test void range_inside_isTrue() { assertTrue(TrainingApi.inRange(40)); }
    @Test void range_atUpper_isTrue() { assertTrue(TrainingApi.inRange(100)); }
    @Test void range_aboveUpper_isFalse() { assertFalse(TrainingApi.inRange(101)); }
    @Test void length_null_isZero() { assertEquals(0, TrainingApi.lengthOrZero(null)); }
    @Test void length_empty_isZero() { assertEquals(0, TrainingApi.lengthOrZero("")); }
    @Test void length_word_countsCharacters() { assertEquals(3, TrainingApi.lengthOrZero("cat")); }
    @Test void clamp_below_isMinimum() { assertEquals(2, TrainingApi.clamp(1, 2, 8)); }
    @Test void clamp_above_isMaximum() { assertEquals(8, TrainingApi.clamp(9, 2, 8)); }
    @Test void clamp_inside_isUnchanged() { assertEquals(5, TrainingApi.clamp(5, 2, 8)); }
    @Test void clamp_equalBounds_returnsOnlyValue() { assertEquals(4, TrainingApi.clamp(9, 4, 4)); }
    @Test void clamp_reversedBounds_hasDocumentedMessage() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> TrainingApi.clamp(5, 8, 2));
        assertEquals("min exceeds max", ex.getMessage());
    }
    @Test void copy_keepsContents() {
        assertArrayEquals(new int[]{2, 4}, TrainingApi.copy(new int[]{2, 4}));
    }
    @Test void copy_hasIndependentState() {
        int[] source = {2, 4};
        int[] copy = TrainingApi.copy(source);
        assertNotSame(source, copy);
        copy[0] = 99;
        assertArrayEquals(new int[]{2, 4}, source);
    }
    @Test void copy_empty_isEmpty() { assertArrayEquals(new int[0], TrainingApi.copy(new int[0])); }
    @Test void copy_null_throws() { assertThrows(NullPointerException.class, () -> TrainingApi.copy(null)); }
    @Test void positives_empty_isZero() { assertEquals(0, TrainingApi.countPositive(new int[0])); }
    @Test void positives_singleton_countsOnlyValue() { assertEquals(1, TrainingApi.countPositive(new int[]{3})); }
    @Test void positives_mixed_countsAllPositiveValues() {
        assertEquals(2, TrainingApi.countPositive(new int[]{-1, 0, 2, 4}));
    }
    @Test void shipping_null_isFalse() { assertFalse(TrainingApi.canShip(null, 1)); }
    @Test void shipping_empty_isFalse() { assertFalse(TrainingApi.canShip("", 1)); }
    @Test void shipping_zeroCount_isFalse() { assertFalse(TrainingApi.canShip("Tea", 0)); }
    @Test void shipping_valid_isTrue() { assertTrue(TrainingApi.canShip("Tea", 1)); }
    @Test void bigInteger_addsValues() {
        BigInteger a = BigInteger.valueOf(2), b = BigInteger.valueOf(3);
        assertEquals(BigInteger.valueOf(5), TrainingApi.add(a, b));
        assertEquals(BigInteger.valueOf(2), a, "input a remains unchanged");
    }
    @Test void bigInteger_firstNull_throws() {
        BigInteger valid = BigInteger.ONE;
        assertThrows(NullPointerException.class, () -> TrainingApi.add(null, valid));
    }
    @Test void bigInteger_secondNull_throws() {
        BigInteger valid = BigInteger.ONE;
        assertThrows(NullPointerException.class, () -> TrainingApi.add(valid, null));
    }
    @Test void counter_startsAtZero() {
        assertEquals(0, counter.get());
        assertTrue(counter.isZero());
        TrainingApi.Counter.requireNonnegative(0);
    }
    @Test void counter_set_replacesPreviousValue() {
        counter.set(3);
        counter.set(5);
        assertEquals(5, counter.get());
    }
    @Test void counter_increment_changesState() {
        counter.set(3);
        counter.increment();
        assertEquals(4, counter.get());
        assertFalse(counter.isZero());
    }
    @Test void counter_negative_leavesStateUnchanged() {
        counter.set(3);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> counter.set(-1));
        assertEquals("value must be nonnegative", ex.getMessage());
        assertEquals(3, counter.get());
    }
    @Test void counter_overflow_leavesStateUnchanged() {
        counter.set(Integer.MAX_VALUE);
        assertThrows(ArithmeticException.class, () -> counter.increment());
        assertEquals(Integer.MAX_VALUE, counter.get());
    }
    @Test void stack_empty_hasZeroSize() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(2);
        assertTrue(stack.isEmpty());
        assertEquals(0, stack.size());
    }
    @Test void stack_twoValues_popInReverseOrder() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(2);
        stack.push("first"); stack.push("second");
        assertEquals("second", stack.pop());
        assertEquals("first", stack.pop());
        assertEquals(0, stack.size());
    }
    @Test void stack_returnsExactStoredReference() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(1);
        String item = new String("tea");
        stack.push(item);
        assertSame(item, stack.pop());
    }
    @Test void stack_full_errorPreservesContents() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(1);
        stack.push("tea");
        assertThrows(IllegalStateException.class, () -> stack.push("coffee"));
        assertArrayEquals(new String[]{"tea"}, stack.snapshot());
    }
    @Test void stack_emptyPop_throws() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(1);
        assertThrows(NoSuchElementException.class, () -> stack.pop());
    }
    @Test void stack_null_throwsBeforeCapacityCheck() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(1);
        stack.push("tea");
        assertThrows(NullPointerException.class, () -> stack.push(null));
        assertEquals(1, stack.size());
    }
    @Test void stack_snapshot_isIndependentArray() {
        TrainingApi.TinyStack stack = new TrainingApi.TinyStack(2);
        stack.push("tea");
        String[] snapshot = stack.snapshot();
        snapshot[0] = "coffee";
        assertEquals("tea", stack.pop());
    }
    @Test void manualException_noExceptionMustFail() {
        try {
            TrainingApi.clamp(5, 8, 2);
            fail("Expected IllegalArgumentException");
        } catch (IllegalArgumentException ex) {
            assertEquals("min exceeds max", ex.getMessage());
        }
    }
}
