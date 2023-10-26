export default
`
attribute vec3 a_vertexPosition;
uniform vec4 u_vertexColor;
uniform mat4 u_mMatrix;
uniform mat4 u_vMatrix;
uniform mat4 u_pMatrix;

varying vec4 v_vertexColor;

void main() {
    gl_Position = u_pMatrix * u_vMatrix * u_mMatrix * vec4(a_vertexPosition, 1);
    v_vertexColor = u_vertexColor;
}
`;
