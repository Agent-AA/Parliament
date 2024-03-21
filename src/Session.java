import java.sql.Date;

public class Session {

    private String name = null;
    private String path = null;
    private final Date date;

    Session(String name) {
        this.name = name;
        date = new Date(System.currentTimeMillis());
    }

    Session(String name, String path) {
        this.name = name;
        this.path = path;
        date = new Date(System.currentTimeMillis());
    }

    public Date getDate() {
        return date;
    }
    
    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }
}
