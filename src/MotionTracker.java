/**
 * Tracks the history and stack of motions.
 */
public class MotionTracker {

    private MotionTracker instance = new MotionTracker();

    private MotionTracker() {}

    public MotionTracker getInstance() {
        return instance;
    }
}
