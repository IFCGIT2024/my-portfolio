package practice;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** These intentionally fail against BrokenUtilities. Fix production code to make them pass. */
class FaultFindingTest {
    @Test void positives_singleton_mustCountLast() {
        assertEquals(1, BrokenUtilities.countPositive(new int[]{3}));
    }
    @Test void contains_equalTextDistinctObject_mustMatch() {
        String stored = new String("tea");
        String searched = new String("tea");
        assertTrue(BrokenUtilities.contains(new String[]{stored}, searched));
    }
    @Test void discount_atThreshold_isEligible() {
        assertTrue(BrokenUtilities.hasDiscount(65));
    }
    @Test void name_null_isRejectedNormally() {
        assertFalse(BrokenUtilities.validName(null));
    }
    @Test void set_replacesInsteadOfAccumulating() {
        BrokenUtilities.Counter counter = new BrokenUtilities.Counter();
        counter.set(3); counter.set(5);
        assertEquals(5, counter.get());
    }
    @Test void take_updatesSizeAfterRemoval() {
        BrokenUtilities.Buffer buffer = new BrokenUtilities.Buffer();
        buffer.put("tea");
        assertEquals("tea", buffer.take());
        assertEquals(0, buffer.size());
    }
}
