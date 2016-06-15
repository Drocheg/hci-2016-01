package hci.itba.edu.ar.tpe2.fragment;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ListFragment;
import android.view.View;
import android.widget.ListView;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

import hci.itba.edu.ar.tpe2.FlightDetailsActivity;
import hci.itba.edu.ar.tpe2.FlightsActivity;
import hci.itba.edu.ar.tpe2.backend.data.Flight;
import hci.itba.edu.ar.tpe2.backend.data.PersistentData;

/**
 * A fragment representing a list of Flights.
 */
public class FlightsListFragment extends ListFragment {
    public static final String PARAM_FLIGHTS_LIST = "hci.itba.edu.ar.tpe2.fragment.FlightsListFragment.FLIGHTS_LIST";

    private FlightAdapter flightAdapter;
    private List<Flight> flights;
    private Activity activity;

    /**
     * Mandatory empty constructor for the fragment manager to instantiate the
     * fragment (e.g. upon screen orientation changes).
     */
    public FlightsListFragment() {}

    public static FlightsListFragment newInstance(List<Flight> flights) {
        FlightsListFragment result = new FlightsListFragment();
        if(flights != null) {
            Bundle params = new Bundle();
            params.putSerializable(PARAM_FLIGHTS_LIST, (Serializable) flights);
            result.setArguments(params);
        }
        return result;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null && getArguments().containsKey(PARAM_FLIGHTS_LIST)) {
            flights = (List<Flight>) getArguments().getSerializable(PARAM_FLIGHTS_LIST);
        }
        else {
            if (flights == null) {
                flights = Collections.EMPTY_LIST;
            }
        }
        flightAdapter = new FlightAdapter(activity, flights);
        setListAdapter(flightAdapter);
    }

    @Override
    public void onResume() {
        super.onResume();
    }


    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        this.activity = activity;
//        try {
//            interactionListener = (OnFragmentInteractionListener) activity;
//        } catch (ClassCastException e) {
////            throw new ClassCastException(activity.toString()
////                    + " must implement OnFragmentInteractionListener");
//            interactionListener = this;
//        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
    }

    @Override
    public void onListItemClick(ListView listView, View view, int position, long id) {
        onFlightClicked((Flight) listView.getItemAtPosition(position));
    }

    //    @Override
    public void onFlightClicked(Flight clickedFlight) {
        Intent detailsIntent = new Intent(activity, FlightDetailsActivity.class);
        detailsIntent.putExtra(FlightDetailsActivity.PARAM_FLIGHT, clickedFlight);
        startActivity(detailsIntent);
    }

    //    @Override
    public boolean onFlightStarred(final Flight starredFlight) {
        PersistentData.getInstance().addFollowedFlight(starredFlight, activity);
        Snackbar.make(getView(), "Following " + starredFlight.toString(), Snackbar.LENGTH_LONG).setAction("Undo", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PersistentData.getInstance().removeFollowedFlight(starredFlight, activity);
                flightAdapter.unstar(starredFlight);
            }
        }).show();
        return true;
    }

    //    @Override
    public boolean onFlightUnstarred(final Flight unstarredFlight) {
        PersistentData.getInstance().removeFollowedFlight(unstarredFlight, activity);
        Snackbar.make(getView(), "Removed " + unstarredFlight.toString(), Snackbar.LENGTH_LONG).setAction("Undo", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PersistentData.getInstance().addFollowedFlight(unstarredFlight, activity);
                flightAdapter.star(unstarredFlight);
            }
        }).show();
        return true;
    }

    /**
     * If you want to override interaction behavior, implement this interface.
     */
    public interface OnFragmentInteractionListener {

        /**
         * Called when a flight is clicked. Default behavior is to start the {@link FlightDetailsActivity}
         * with the clicked Flight.
         *
         * @param clickedFlight The clicked flight.
         */
        void onFlightClicked(Flight clickedFlight);

        /**
         * Called when a flight is starred. Default behavior is to add it to followed flights, and
         * show a Snackbar. The return value will determine whether the star icon changes or not.
         *
         * @param starredFlight The starred flight.
         * @return {@code true} If the star icon should toggle, {@code false} otherwise.
         */
        boolean onFlightStarred(Flight starredFlight);

        /**
         * Called when a flight is unstarred. Default behavior is to remove it from followed flights,
         * and show a Snackbar.
         *
         * @param unstarredFlight The unstarred flight.
         * @return {@code true} If the star icon should toggle, {@code false} otherwise.
         */
        boolean onFlightUnstarred(Flight unstarredFlight);
    }
}
