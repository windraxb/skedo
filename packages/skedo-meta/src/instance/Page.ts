import { Topic } from "../Topic"
import { Node } from "./Node"
import { NodeType, NodeJsonStructure,  NodeData, BoxDescriptorInput} from "../standard.types"
import { BoxDescriptor } from "../BoxDescriptor"
import { Logger, Emiter } from "@skedo/utils"
import {ComponentMeta} from '../meta/ComponentMeta'
import {fromJS} from 'immutable'



type ComponentsLoader = {
  loadByName : (group : string, name : string) => ComponentMeta
}

export class Page extends Emiter<Topic>{
  root : NodeType
  id_base : number 
  nodes : Array<Node>
  pageNode : NodeType
  name : string
  logger : Logger = new Logger('page')
  loader : ComponentsLoader

  constructor(name : string, json : NodeJsonStructure, loader : ComponentsLoader ){
    super()
    this.name = name
    this.id_base = 1
    this.nodes = []
    this.loader = loader

    const box = new BoxDescriptor({
      left : 0,
      top : 0,
      width : 3200,
      height : 3200
    })
    const meta = this.loader.loadByName("basic", "root")
    this.root = new Node(meta, meta.createData(this.createId(), box))
    this.linkPage(this.root)
    const pageNode = this.fromJson(json)
    pageNode.setAllowDrag(false)
    this.root.addToAbsolute(pageNode)
    this.pageNode = pageNode
    
    // @ts-ignore
    // 调试用
    window["root"] = this.root
  }


  createFromJSON = (json: NodeJsonStructure) => {
    return this.fromJson(json)
  }

  createFromMetaNew(
    meta : ComponentMeta,
    position : [number, number]
  ) {
    const box = meta.box.clone()
    const id = this.createId()
    const nodeData = meta.createData(id, box)
    const node = new Node(
      meta,
      nodeData
    )
    this.linkPage(node)
    return node 
  }

  fromJson(
    json: NodeJsonStructure
  ): Node {

    const box = new BoxDescriptor(json.box)
    const meta = this.loader.loadByName(
      json.group,
      json.name
    )
    
    if(json.id) {
      this.id_base = Math.max(this.id_base, json.id + 1)
    }
    const id = json.id || this.createId() 
    
    const instanceData = json.id ? 
      meta.createDataFromJson(json) : meta.createData(id, box) 
    const node = new Node(meta, instanceData as NodeData)
    this.linkPage(node)

    if(!json.id) {
      json.children &&
        json.children.forEach((child) => {
          node.addToRelative(this.fromJson(child))
        })
    } else {
      json.children &&
        node.setChildren(json.children.map(child => {
          const childNode = this.fromJson(child)
          childNode.setParent(node)
          return childNode
        }))
    }
    return node
  }

  copy(source : NodeType) {
    const rect = source.getRect()
    const id = this.id_base++

    const box = new BoxDescriptor({
      left : rect.left,
      top : rect.top,
      width : rect.width,
      height : rect.height
    })


    const data = source.meta.createData(id, box)
    const node = new Node(
      source.meta,
      data
    )
    source.getChildren().forEach((child) => {
      node.addToRelative(this.copy(child))
    })
    this.linkPage(node)
    return node
  }

  private createId(){
    return this.id_base++
  }

  private linkPage(node : Node) {
    this.nodes[node.getId()] = node
  }


  // renderExternal(node : NodeType, elem: HTMLElement) {
  //   const component = <InjectComponent node={node} editor={this.editor} />
  //   this.logger.log("render external", elem, component)
  //   ReactDOM.render(component, elem)
  // }
}