import java.io.File;

public class FileManager {

    /**
     * Creates a new directory
     * @param name String the file's name
     * @param path String the file's path
     * @return boolean: true if the directory was created, false if it already exists
     */
    public static boolean createDir(String name, String path) {

        File f = new File(path + name);

        return f.mkdir();
    }
}