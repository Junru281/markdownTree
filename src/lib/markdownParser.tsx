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
                value: child.children[0].value,
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
                value: child.children[0].value,
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