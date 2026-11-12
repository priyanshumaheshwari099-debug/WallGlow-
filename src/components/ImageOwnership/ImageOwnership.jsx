
import "./ImageOwnership.css";

function ImageOwnership({ checked, onChange }) {
  return (
    <div className="ps-ownership-box">
      <div className="ps-ownership-heading">
        <span className="ps-ownership-icon">🛡️</span>
        <div>
          <h3>Image Ownership & Privacy</h3>
          <span>Before you start designing</span>
        </div>
      </div>

      <label className="ps-ownership-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />

        <span>
          I confirm that this room image is my own or I have permission
          from its owner to upload and use it.
        </span>
      </label>

      <div className="ps-ownership-note">
        <span>🔒</span>
        <p>
          Please upload only original images or images you are authorized
          to use. Your images are handled according to our privacy practices.
        </p>
      </div>
    </div>
  );
}

export default ImageOwnership;
