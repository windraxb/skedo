import { Cord } from './Cord'
import { Node } from './Node'
import { Rect } from '../Rect'

export class MountPoint {
	ele : HTMLElement
	node : Node
	cord : Cord

	constructor(ele : HTMLElement, node : Node, cord : Cord) {
		this.ele = ele
		this.cord = cord
		this.node = node
	}


	getRect() : Rect{
		const rect = this.ele.getBoundingClientRect()
		const parent = this.node.getParent()
		if(parent && parent.getMountPoint()) {
			const [x, y] = this.positionDiff(parent)
			return new Rect(
				Math.round(x),
				Math.round(y),
				Math.round(rect.width),
				Math.round(rect.height),
			)
		}
		return new Rect(
			Math.round(0),
			Math.round(0),
			Math.round(rect.width),
			Math.round(rect.height),
		)
		

	}

	getAbsPosition() : Array<number>  {
		const rect = this.ele.getBoundingClientRect()
		const cord = this.cord
		if(!cord) {
			throw new Error("Page is not initialized to node.")
		}
		const left = Math.round(rect.left + cord.scrollX - cord.viewport.left)
		const top = Math.round(rect.top+ cord.scrollY - cord.viewport.top)
		return [left, top]
	}

	positionDiff(node : Node){
		const rect1 = this.ele.getBoundingClientRect()
		const rect2 = node.getMountPoint()?.ele.getBoundingClientRect()
		if(!rect2) {
			throw new Error("You cannot call positiondiff on unmounted node.")
		}

		return [rect1.left - rect2.left, rect1.top - rect2.top]

	}

}