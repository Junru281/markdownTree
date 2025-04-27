import { unified } from "unified";
import remarkParse from "remark-parse";

function parseMarkdownToAST(markdown: string) {
    // 创建一个处理器实例，并配置 remark-parse 插件
    const processor = unified().use(remarkParse);

    // 解析 Markdown 文本，生成 AST（抽象语法树）
    const ast = processor.parse(markdown);

    // 将 AST 转换为格式化后的 JSON 字符串，并打印到控制台
    console.log(JSON.stringify(ast, null, 2));

    return ast;
   
}

function toMarkdown(nodes) {
    return nodes.map((node) => {
      if (node.type === "text") return node.value;
      if (node.type === "strong") return `**${toMarkdown(node.children)}**`;
      if (node.type === "emphasis") return `*${toMarkdown(node.children)}*`;
      if (node.type === "inlineCode") return `\`${node.value}\``;
      if (node.type === "link") return `[${toMarkdown(node.children)}](${node.url})`;
      if (node.type === "list")  return toListMarkdown(node.children, {ordered: node.ordered})
      if (node.type === 'listItem') return toMarkdown(node.children)
      if (node.type === "paragraph") return toMarkdown(node.children);
      return "";
    }).join("\n");
  }

  function toListMarkdown(nodes, { ordered }) {
    return nodes.map((node, idx) => {
      if (node.type === "listItem") {
        const content = toMarkdown(node.children);
        const prefix = ordered ? `${idx + 1}. ` : '- ';
        const lines = content.split('\n');
       return prefix + lines[0] + (lines.length > 1 ? '\n' + lines.slice(1).map(line => '  ' + line).join('\n') : '');
      }
      return "";
    }).join("\n");
  }

  


function convertAstToTree(ast: any) {
    // 将 AST 转换为树结构

    const stack: any[] = []
    stack.push({
        type: 'root',
        children: [],
        depth: 0
    })

    for (let child of ast.children) {
        let currentNode = stack[stack.length - 1]
        if (child.type === "heading") {
            const newNode = {
                type: child.type,
                value: `${"#".repeat(child.depth)} ${toMarkdown(child.children)}`,
                children: [],
                depth: child.depth
            }
            if (currentNode.depth < child.depth) { 
                currentNode.children.push(newNode)
                stack.push(newNode)
            }else{
                while (stack.length > 1 && stack[stack.length - 1].depth >= child.depth) {
                    stack.pop();
                }
                let parent = stack[stack.length - 1];
                parent.children.push(newNode);
                stack.push(newNode);
            }
        }else{
            currentNode.children.push({
                type: child.type,
                // 搞了我两个小时，原来是在这里的时候不应该传child.children,而是应该直接放child
                value: toMarkdown([child]),
                children: []
            })
        }
    };
    console.log(stack[0], 'tree');
    return stack[0];
}

export function parseMarkdownToTree(markdown: string) {
    const ast = parseMarkdownToAST(markdown);
    const tree = convertAstToTree(ast);
    return tree;
}