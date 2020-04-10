import { CubeFaces } from './CubeFaces'
import {
	BufferGeometry,
	BufferAttribute,
	Group,
	Mesh,
	Material,
	MathUtils,
} from 'three'

export function createCube(
	width: number,
	height: number,
	depth: number,
	[uvX, uvY]: [number, number],
	[tW, tH]: [number, number],
	mirror: boolean
) {
	const positions: number[] = []
	const normals: number[] = []
	const uvs: number[] = []
	const indices: number[] = []

	for (const {
		dir,
		corners,
		baseUV: [baseUVX, baseUVY],
	} of CubeFaces) {
		const ndx = positions.length / 3

		for (const {
			pos: [oX, oY, oZ],
			uv,
		} of corners) {
			positions.push((mirror ? -oX : oX) * width, oY * height, oZ * depth)
			normals.push(...dir)

			uvs.push(
				//Base offset of the current cube
				(uvX +
					//Horizontal offset for the current face
					(Number(baseUVX > 0) + Number(baseUVX > 2)) *
						Math.floor(depth) +
					Number(baseUVX > 1) * Math.floor(width) +
					//Face corner specific offsets
					uv[0] *
						(baseUVX === 0 || (baseUVY === 1 && baseUVX === 2)
							? Math.floor(depth)
							: Math.floor(width))) /
					tW,
				//Align uv to top left corner
				1 -
					//Base offset of the current cube
					(uvY +
						//Vertical offset for the current face
						baseUVY * Math.floor(depth) +
						(baseUVY === 0
							? Math.floor(depth)
							: Math.floor(height)) -
						//Face corner specific offsets
						uv[1] *
							(baseUVY === 0
								? Math.floor(depth)
								: Math.floor(height))) /
						tH
			)
		}

		indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3)
	}

	const createGeometry = () => {
		let geo = new BufferGeometry()
		geo.setAttribute(
			'position',
			new BufferAttribute(new Float32Array(positions), 3)
		)
		geo.setAttribute(
			'normal',
			new BufferAttribute(new Float32Array(normals), 3)
		)
		geo.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
		geo.setIndex(indices)

		return geo
	}

	return {
		createGeometry,
		createMesh(
			material: Material,
			origin: [number, number, number],
			pivot?: [number, number, number],
			rotation?: [number, number, number]
		) {
			let geo = createGeometry()
			let mesh = new Mesh(geo, material)

			if (pivot && rotation) {
				const [rX, rY, rZ] = rotation
				let group = new Group()
				group.position.set(-pivot[0], pivot[1], pivot[2])
				mesh.position.set(
					-origin[0] - width / 2 + pivot[0],
					origin[1] - pivot[1],
					origin[2] - pivot[2]
				)
				group.add(mesh)

				group.name = `#cubePivot.${name}`
				group.rotation.set(
					MathUtils.degToRad(-rX),
					MathUtils.degToRad(-rY),
					MathUtils.degToRad(rZ)
				)

				return group
			}

			mesh.position.set(-origin[0] - width / 2, origin[1], origin[2])

			return mesh
		},
	}
}
