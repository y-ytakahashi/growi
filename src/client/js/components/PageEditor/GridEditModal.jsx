import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

export default class GridEditModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      gridHtml: '',
    };

    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
    this.pasteCodedGrid = this.pasteCodedGrid.bind(this);
  }

  init(gridHtml) {
    const initGridHtml = gridHtml;
    this.setState({ gridHtml: initGridHtml }, function() {
      // display gridHtml for re-editing
      console.log(this.state.gridHtml);
    });
  }

  show(gridHtml) {
    this.init(gridHtml);
    this.setState({ show: true });
  }

  hide() {
    this.setState({ show: false });
  }

  cancel() {
    this.hide();
  }

  pasteCodedGrid() {
    // dummy data
    const pastedGridData = `::: editable-row\n<div class="container">\n\t<div class="row">\n\t${this.convertRatiosAndSizeToHTML([1, 5, 6], '')}\t</div>\n</div>\n:::`;
    // display converted html on console
    console.log(this.convertRatiosAndSizeToHTML([1, 5, 6], ''));

    if (this.props.onSave != null) {
      this.props.onSave(pastedGridData);
    }
    this.cancel();
  }

  showBgCols() {
    const cols = [];
    for (let i = 0; i < 12; i++) {
      // [bg-light:TODO support dark mode by GW-3037]
      cols.push(<div className="bg-light grid-bg-col col-1"></div>);
    }
    return cols;
  }

  showEditableCols() {
    const cols = [];
    for (let i = 0; i < 12; i++) {
      // [bg-light:TODO support dark mode by GW-3037]
      cols.push(<div className="bg-dark grid-bg-col col-1"></div>);
    }
    return cols;
  }

  convertRatiosAndSizeToHTML(ratioNumbers, responsiveSize) {
    let cols = '';
    for (let i = 0; i < ratioNumbers.length; i++) {
      const className = `col${responsiveSize ? `-${responsiveSize}` : ''}-${ratioNumbers[i]} bsGrid${i + 1}`;
      cols += `<div class="${className}"></div>\n`;
    }
    return cols;
  }

  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="xl">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          Edit Grid
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-3">
                <h5>Phone</h5>
                <div className="device-container"></div>
                <h5>Tablet</h5>
                <div className="device-container"></div>
                <h5>Desktop</h5>
                <div className="device-container"></div>
                <h5>Large Desktop</h5>
                <div className="device-container"></div>
              </div>
              <div className="col-9">
                <div className="row h-100">
                  {this.showBgCols()}
                </div>
                <div className="row w-100 h-100 position-absolute grid-editable-row">
                  {/* [Just an example to check if bg-cols and editable-cols fit] */}
                  <div className="bg-dark grid-editable-col col-3"></div>
                  <div className="bg-dark grid-editable-col col-5"></div>
                  <div className="bg-dark grid-editable-col col-4"></div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="grw-modal-footer">
          <div className="ml-auto">
            <button type="button" className="mr-2 btn btn-secondary" onClick={this.cancel}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={this.pasteCodedGrid}>Done</button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }

}

GridEditModal.propTypes = {
  onSave: PropTypes.func,
};
