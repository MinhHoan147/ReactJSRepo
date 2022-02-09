import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import './DoctorSchedule.scss'
import { LANGUAGES } from '../../../utils';
import moment, { locale } from 'moment';
import localization from 'moment/locale/vi';
import { getScheduleDoctorByDate } from '../../../services/userService'
import { FormattedMessage } from 'react-intl';
import BookingModal from './Modal/BookingModal'

class DoctorSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
            isOpenModalBooking: false,
            dataScheduleTimeModal: {},
        }
    }

    async componentDidMount() {
        let language = this.props.language;
        // console.log('Moment Vie: ', moment(new Date()).format('dddd - DD/MM'));
        // console.log('Moment En: ', moment(new Date()).locale('en').format('ddd - DD/MM'));
         let allDays = this.getArrDays(language)

        if(this.props.detailDoctorIdFromParent) {
           let res = await getScheduleDoctorByDate(this.props.detailDoctorIdFromParent,allDays[0].value);
           this .setState ({
               allAvailableTime: res.data ? res.data : []
           })
        }

        this.setState({
            allDays: allDays,
        })
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Tạo dánh sách các ngày trong tuần
    getArrDays = (language) => {
        let arrDays = []
        for (let i = 0; i < 7; i++) {

            let object = {};

            if (language === LANGUAGES.VI) {
                if (i === 0) {
                    let ddMM = moment(new Date()).format('DD/MM')
                    let today = `Hôm nay - ${ddMM}`
                    object.label = today
                } else {
                    let labelVi = moment(new Date()).add(i, "days").format('dddd - DD/MM')
                    object.label = this.capitalizeFirstLetter(labelVi);
                }

            } else {
                if (i === 0) {
                    let ddMM = moment(new Date()).format('DD/MM')
                    let today = `Today - ${ddMM}`
                    object.label = today
                } else {
                    object.label = moment(new Date()).add(i, "days").locale('en').format('dd - DD/MM');
                }

            }

            object.value = moment(new Date()).add(i, "days").startOf('day').valueOf();
            arrDays.push(object);
        }
        return arrDays;
    }

    //load schedule từ database ứng với từng bác sĩ thông qua ID
    handleOnChangeSelect = async (event) => {
        if (this.props.detailDoctorIdFromParent && this.props.detailDoctorIdFromParent !== -1) {
            let doctorId = this.props.detailDoctorIdFromParent
            let date = event.target.value

            let res = await getScheduleDoctorByDate(doctorId, date);

            if (res && res.code === 0) {
                this.setState({
                    allAvailableTime: res.data ? res.data : []
                })

            }
            console.log(res);
        }
    }

    async componentDidUpdate(prevProps, precState, snapshot) {
        if (this.props.language !== prevProps.language) {

            let allDays = this.getArrDays(this.props.language);
            this.setState({
                allDays: allDays
            })
        }

        if (this.props.detailDoctorIdFromParent !== prevProps.detailDoctorIdFromParent) {
            let allDays = this.getArrDays(this.props.language);
            let res = await getScheduleDoctorByDate(this.props.detailDoctorIdFromParent, allDays[0].value);
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })

        }
    }

    handleClickScheduleTime = (time) => {
        this.setState({
            isOpenModalBooking: true,
            dataScheduleTimeModal: time,
        })

        console.log('CHeck time: ', time);
    }

    closeBookingClose = () => {
        this.setState({
            isOpenModalBooking: false,

        })
    }



    render() {
        let allDays = this.state.allDays;
        let allAvailableTime = this.state.allAvailableTime
        let isOpenModalBooking = this.state.isOpenModalBooking;
        let dataScheduleTimeModal = this.state.dataScheduleTimeModal
        let language = this.props.language;


        return (
            <>
                <div className='doctor-schedule-container'>
                    <div className='all-schedule'>
                        <select onChange={(event) => this.handleOnChangeSelect(event)}>
                            {allDays && allDays.length > 0 &&
                                allDays.map((item, index) => {
                                    return (
                                        <option value={item.value} key={index}>
                                            {item.label}
                                        </option>
                                    )
                                })}
                        </select>
                    </div>

                    <div className='all-available-time'>
                        <div className='text-calendar'>
                            <i className='fas fa-calendar-alt'>
                                <span><FormattedMessage id='patient.detail-doctor.schedule' /></span>
                            </i>
                        </div>
                        <div className='time-content'>
                            {allAvailableTime && allAvailableTime.length > 0 ?
                                <>
                                    <div className='time-content-btns'>
                                        {allAvailableTime.map((item, index) => {

                                            let timeDisplay = language === LANGUAGES.VI ?
                                                item.timeTypeData.valueVi : item.timeTypeData.valueEn;

                                            return (
                                                <button key={index} className={language === LANGUAGES.VI ? 'btn-vie' : 'btn-en'}
                                                 onClick={() => this.handleClickScheduleTime(item)}
                                                >
                                                   {timeDisplay}
                                                </button>
                                            )
                                        })
                                        }
                                    </div>

                                    <div className='book-free'>
                                        <span>
                                            <FormattedMessage id='patient.detail-doctor.choose' />
                                            <i className='far fa-hand-point-up'></i>
                                            <FormattedMessage id='patient.detail-doctor.book-free' />
                                        </span>
                                    </div>
                                </>
                                :
                                <div className='no-schedule'>
                                    <FormattedMessage id='patient.detail-doctor.no-schedule' />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <BookingModal
                    isOpenModal={isOpenModalBooking}
                    closeBookingClose={this.closeBookingClose}
                    dataTime={dataScheduleTimeModal}
                />
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchedule);