import { FileTree, Tabs } from "nextra/components";

type Props = {
  tree: string[];
};

export default function EndStateTree({
  tree,
}: Props) {
  return (
    <div data-drash-end-state-tree className="mt-6">
      <p className="mt-6 leading-7 first:mt-0">
        After completing the steps in this section, your project&apos;s
        directory should look similar to the directory tree below.
      </p>
      {
        /* <Tabs items={["TypeScript"]}>
        <Tabs.Tab> */
      }
      <FileTree>
        <FileTree.Folder
          name="path/to/your/project"
          defaultOpen
        >
          {tree.map((file, index) => {
            return (
              <FileTree.File
                key={`file-` + file + index}
                name={file}
              />
            );
          })}
        </FileTree.Folder>
      </FileTree>
      {/* </Tabs.Tab> */}
      {
        /* <Tabs.Tab>
          <FileTree>
            <FileTree.Folder
              name="path/to/your/project"
              defaultOpen
            >
              {tree.map((file, index) => {
                return (
                  <FileTree.File
                    key={`file-` +
                      file.replace(".ts", ".js") + index}
                    name={file.replace(".ts", ".js")}
                  />
                );
              })}
            </FileTree.Folder>
          </FileTree>
        </Tabs.Tab> */
      }
      {/* </Tabs> */}
    </div>
  );
}
