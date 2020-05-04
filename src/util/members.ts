/// @doc-blocks-to-json members-only

import { walkSync } from "../../deps.ts";

/**
 * @memberof Drash.Util.Exports
 * @function getFileSystemStructure
 *
 * @description
 *     Get the filesystem structure of the directory (recursively).
 *
 * @return string
 *     Returns the following object:
 *     {
 *       basename: "filename",
 *       extension: extension, // does not account for .min.extension or similar extensions
 *       filename: filename.extension,
 *       path: "/path/to/the/file/dir/filename.extension",
 *       pathname: "/path/to/the/file/dir",
 *       snake_cased: filename_extension
 *     }
 */
export function getFileSystemStructure(dir: string): any {
  let files = [];

  for (const fileInfo of walkSync(dir)) {
    let filename = fileInfo.path;
    let path = filename;
    let filenameSplit = filename.split("/");
    filename = filenameSplit[filenameSplit.length - 1];
    // FIXME(crookse)
    // There's a better way to do this, but it's like 0800 right now and I
    // haven't had a full cup of coffee yet. -___________-
    // Also, we do a + 1 to the filename.length because we want to remove the
    // trailing slash.
    let pathname = path.slice(0, -(filename.length + 1));
    files.push({
      // filename
      basename: filename.split(".")[0],
      // extension
      extension: filename.split(".")[1], // This doesn't account for .min. type files
      // filename.extension
      filename: filename,
      // /path/to/the/file/dir/filename.extension
      path: path,
      // /path/to/the/file/dir
      pathname: pathname,
      // filename_extension
      snake_cased: filename.replace(".", "_"),
      // Is this file a directory?
      isDirectory: () => {
        let extension = filename.split(".")[1];
        return !extension;
      },
    });
  }

  return files;
}
